class RouteDescriptor {
    constructor(name, description, canonicalPath = null) {
        this._name = name;
        this._description = description;
        this._canonicalPath = canonicalPath;
    }

    setTitle() {
        document.title = 'WebTimer | ' + this._name;
    }

    setMetaDescription() {
        const meta = document.querySelector('meta[name="description"]');

        if (meta)
            meta.content = this._description;
    }

    setCanonicalLink() {
        const relation = 'canonical';
        let linkEl = document.head.querySelector(`link[rel="${relation}"]`);
        
        if (this._canonicalPath == null) {
            if (linkEl)
                linkEl.remove();

            return;
        }
        
        if (!linkEl) {
            linkEl = document.createElement('link');
            linkEl.rel = relation;
            document.head.appendChild(linkEl);
        }

        const path = this._canonicalPath.endsWith('/') ? 
            this._canonicalPath.substr(0, this._canonicalPath.length - 1) : 
            this._canonicalPath;
        const url = location.origin + path;
        if (linkEl.href !== url)
            linkEl.href = url;
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
        this._descriptor.setCanonicalLink();
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
