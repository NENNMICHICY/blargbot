import { createSafeRegExp } from '@blargbot/core/utils/index.js';

import { CompiledSubtag } from './compilation/CompiledSubtag.js';
import { BBTagRuntimeError } from './errors/index.js';

export abstract class RegexSubtag extends CompiledSubtag {

    protected createRegex(regexStr: string): RegExp {
        try {
            const regexResult = createSafeRegExp(regexStr);
            switch (regexResult.state) {
                case 'success': return regexResult.regex;
                case 'invalid': throw new BBTagRuntimeError('Invalid Regex');
                case 'tooLong': throw new BBTagRuntimeError('Regex too long');
                case 'unsafe': throw new BBTagRuntimeError('Unsafe Regex');
            }
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new BBTagRuntimeError(err.message);
            throw err;
        }
    }
}
