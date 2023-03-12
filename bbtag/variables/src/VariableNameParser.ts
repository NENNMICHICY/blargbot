import type { VariableScopeProvider } from './VariableScopeProvider.js';

export class VariableNameParser<Context, Scope> {
    readonly #scopes: Array<VariableScopeProvider<Context, Scope>>;

    public constructor(scopes: Iterable<VariableScopeProvider<Context, Scope>>) {
        this.#scopes = [...scopes].sort((a, b) => b.prefix.length - a.prefix.length);
    }

    public parse(context: Context, variable: string): { scope: Scope; name: string; } {
        const provider = this.#scopes.find(s => variable.startsWith(s.prefix));
        if (provider === undefined)
            throw new Error('Missing default variable scope');

        return {
            scope: provider.getScope(context),
            name: variable.slice(provider.prefix.length)
        };
    }

}
