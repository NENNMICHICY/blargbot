import { processAsyncResult } from '@bbtag/engine';
import { Subtag, transparentResultAdapter } from '@bbtag/subtag';

import { ArrayPlugin } from '../../plugins/ArrayPlugin.js';
import { StringPlugin } from '../../plugins/StringPlugin.js';
import { p } from '../p.js';

export class SwitchSubtag extends Subtag {
    public constructor() {
        super({
            name: 'switch'
        });
    }

    @Subtag.signature({ id: 'default' })
        .parameter(p.string('value'))
        .parameter(p.group(
            p.string('case'),
            p.deferred('then')
        ).repeat().flatMap(function* (values, script) {
            const array = script.process.plugins.get(ArrayPlugin);
            const string = script.process.plugins.get(StringPlugin);
            for (const [caseValue, then] of values) {
                const asArray = array.parseArray(caseValue);
                const options = asArray?.v.map(v => string.toString(v)) ?? [caseValue];
                yield { options, then };
            }
        }))
        .parameter(p.deferred('default').optional(() => processAsyncResult(''), true))
        .useConversion(transparentResultAdapter)
    public switch<T>(
        value: string,
        cases: Iterable<{ readonly options: Iterable<string>; readonly then: () => T; }>,
        defaultCase: () => T
    ): T {
        for (const { options, then } of cases) {
            for (const option of options)
                if (option === value)
                    return then();
        }
        return defaultCase();
    }
}
