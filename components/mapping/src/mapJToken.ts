import { createMapping } from './createMapping';
import { result } from './result';
import { TypeMapping } from './types';

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
