import { createMapping } from './createMapping.js';
import { result } from './result.js';
import type { TypeMapping } from './types.js';

export const mapJToken: TypeMapping<JToken> = createMapping(value => {
    switch (typeof value) {
        case 'bigint':
        case 'symbol':
        case 'undefined':
        case 'function': return result.failed;
        case 'boolean':
        case 'number':
        case 'object':
        case 'string': return result.success(value as JToken);
    }
});
