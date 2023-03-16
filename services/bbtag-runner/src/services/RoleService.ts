import type { BBTagRuntime, Entities, FindEntityOptions, RoleService as BBTagRoleService } from '@bbtag/blargbot';

export class RoleService implements BBTagRoleService {
    public create(context: BBTagRuntime, options: Entities.RoleCreate, reason?: string | undefined): Promise<Entities.Role | { error: string; }> {
        context;
        options;
        reason;
        throw new Error('Method not implemented.');
    }
    public edit(context: BBTagRuntime, roleId: string, update: Partial<Entities.Role>, reason?: string | undefined): Promise<{ error: string; } | undefined> {
        context;
        roleId;
        update;
        reason;
        throw new Error('Method not implemented.');
    }
    public delete(context: BBTagRuntime, roleId: string, reason?: string | undefined): Promise<{ error: string; } | undefined> {
        context;
        roleId;
        reason;
        throw new Error('Method not implemented.');
    }
    public querySingle(context: BBTagRuntime, query: string, options?: FindEntityOptions | undefined): Promise<Entities.Role | undefined> {
        context;
        query;
        options;
        throw new Error('Method not implemented.');
    }
}
