import type { Statement, SubtagCall } from '../language/index.js';

export function stringify(bbtag: Statement | SubtagCall): string {
    if ('values' in bbtag) {
        return bbtag.values.map(val => typeof val === 'string' ? val : stringify(val)).join('');
    }

    const parts = [bbtag.name, ...bbtag.args]
        .map(stringify)
        .join(';');
    return `{${parts}}`;
}
