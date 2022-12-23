import { BBTagRuntimeError } from '@bbtag/engine';
import { Subtag } from '@bbtag/subtag';
import { parse } from '@blargbot/core/utils/index.js';
import { mapping } from '@blargbot/mapping';
import fetch from 'node-fetch';

import { p } from '../p.js';

const domainRegex = /^https?:\/\/(.+?)(?:\/.?|$)/i;

export class RequestSubtag extends Subtag {
    public constructor() {
        super({
            name: 'request',
            category: SubtagType.BOT,
            description: tag.description,
            definition: [
                {
                    parameters: ['url', 'options?', 'data?'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'json',
                    execute: (ctx, [url, options, data]) => this.requestUrl(ctx, url.value, options.value, data.value)
                }
            ]
        });
    }

    public async requestUrl(
        context: BBTagContext,
        url: string,
        optionsStr: string,
        dataStr: string
    ): Promise<JObject> {
        const domainMatch = domainRegex.exec(url);
        if (domainMatch === null)
            throw new BBTagRuntimeError(`A domain could not be extracted from url: ${url}`);

        const domain = domainMatch[1];
        if (!context.util.canRequestDomain(domain))
            throw new BBTagRuntimeError(`Domain is not whitelisted: ${domain}`);

        const request = {
            method: 'GET',
            headers: {} as Record<string, string>,
            size: 8000000,
            body: undefined as string | undefined
        };

        if (optionsStr !== '') {
            const mappedOptions = mapOptions(optionsStr);
            if (!mappedOptions.valid)
                throw new BBTagRuntimeError('', `Invalid request options "${optionsStr}"`);
            request.method = mappedOptions.value.method;
            request.headers = mappedOptions.value.headers;
        }

        let data;
        try {
            data = JSON.parse(dataStr);
        } catch { /* NOOP */ }

        let query;
        if (request.method === 'GET') {
            if (typeof data === 'object' && data !== null) {
                query = new URLSearchParams(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, parse.string(v as JToken)] as const))).toString();
                data = undefined;
            }
        } else if (data !== undefined) {
            if (!Object.keys(request.headers).map(h => h.toLowerCase()).includes('content-type'))
                request.headers['Content-Type'] = 'application/json';
            request.body = JSON.stringify(data);
        } else {
            request.body = dataStr;
        }

        const response = await fetch(url + (query !== undefined ? `?${query}` : ''), request);
        const result = {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            date: response.headers.get('date'),
            url: response.url
        };

        /*
                I personally absolutely hate how blarg decides to error if a status code is not consider 'ok'
                A lot of APIs actually have meaningful errors, coupled with a 'not-ok' status and it's ass that blarg doesn't return it.
                TODO change this to return always regardless of statusCode OR add a parameter like [rawResponse] for getting the response object always without breaking bbtag.
            */
        if (!(response.status >= 200 && response.status < 400))
            throw new BBTagRuntimeError(`${response.status} ${response.statusText}`);

        if (result.contentType?.startsWith('text') !== false)
            return { body: await response.text(), ...result };

        if (result.contentType.includes('application/json'))
            return { body: await response.json() as JToken, ...result };

        const body = await response.arrayBuffer();
        return { body: Buffer.from(body).toString('base64'), ...result };
    }
}

const mapOptions = mapping.json(mapping.object({
    method: mapping.string
        .map(s => s.toUpperCase())
        .chain(mapping.in('GET', 'POST', 'PUT', 'PATCH', 'DELETE'))
        .optional
        .map(v => v ?? 'GET'),
    headers: mapping.choice(
        mapping.json(mapping.record(mapping.jToken.map(parse.string))),
        mapping.record(mapping.jToken.map(parse.string))
    ).optional.map(v => v ?? {})
}));
