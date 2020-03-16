class RouteDescriptor {
    constructor(name, description) {
        this._name = name;
        this._description = description;
    }

    setTitle() {
        document.title = 'WebTimer | ' + this._name;
    }

    setMetaDescription() {
        const meta = document.querySelector('meta[name="description"]');

        if (meta)
            meta.content = this._description;
    }
}

class MetaConstructor {
    constructor(meta) {
        this._descriptor = meta.descriptor;
        this._requiresAuth = meta.requiresAuth;
        this._requiresAdminRole = meta.requiresAdminRole;
    }
    
    applyDescriptor() {
        if (!this._descriptor)
            return;

        this._descriptor.setMetaDescription();
        this._descriptor.setTitle();
    }

    isAuthRequired() { return this._requiresAuth || this.isForAdmin(); }

    isForAdmin() { return this._requiresAdminRole; }

    static produce(routerDescriptor, requiresAuth = false, requiresAdminRole = false) {
        return {
            descriptor: routerDescriptor,
            requiresAuth: requiresAuth,
            requiresAdminRole: requiresAdminRole
        };
    }
}

export { RouteDescriptor, MetaConstructor };
