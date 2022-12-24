import { createHash, getHashes } from 'node:crypto';

import { BBTagRuntimeError } from '@bbtag/engine';
import { numberResultAdapter, Subtag } from '@bbtag/subtag';

import { p } from '../p.js';

export class HashSubtag extends Subtag {
    public static get methods(): readonly string[] {
        return getHashes().filter(h => allowedHashes.has(h));
    }

    public constructor() {
        super({
            name: 'hash'
        });
    }

    @Subtag.signature({ id: 'basic' })
        .parameter(p.string('text'))
        .useConversion(numberResultAdapter)
    public computeHash(text: string): number {
        return text.split('')
            .reduce(function (a, b) {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
    }

    @Subtag.signature({ id: 'secure' })
        .parameter(p.string('algorithm'))
        .parameter(p.string('text'))
    public computeStrongHash(algorithm: string, text: string): string {
        if (!HashSubtag.methods.includes(algorithm.toLowerCase()))
            throw new BBTagRuntimeError('Unsupported hash', `${algorithm} is not a supported hash algorithm`);

        const data = text.startsWith('buffer:') ? Buffer.from(text.slice(7), 'base64')
            : text.startsWith('text:') ? Buffer.from(text.slice(5))
                : Buffer.from(text);

        const hash = createHash(algorithm.toLowerCase());
        return hash.update(data).digest('hex');
    }
}

const allowedHashes = new Set([
    'md5',
    'sha1',
    'sha256',
    'sha512',
    'whirlpool'
]);
