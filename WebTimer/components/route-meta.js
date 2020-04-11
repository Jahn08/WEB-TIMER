class RouteDescriptor {
    constructor(name, description, preventRobots = false, canonicalPath = null) {
        this._name = name;
        this._description = description;
        this._canonicalPath = canonicalPath;
        this._preventRobots = preventRobots;
    }

    setTitle() {
        document.title = 'WebTimer | ' + this._name;
    }

    setMetaDescription() {
        const meta = this._getMetaTagByName('description');

        if (meta)
            meta.content = this._description;
    }

    _getMetaTagByName(name) {
        return document.querySelector(`meta[name="${name}"]`);
    }

    setCanonicalLink() {
        const relation = 'canonical';
        let linkEl = document.head.querySelector(`link[rel="${relation}"]`);
        
        if (this._canonicalPath == null || this._preventRobots) {
            if (linkEl)
                linkEl.remove();

            return;
        }
        
        if (!linkEl) {
            linkEl = document.createElement('link');
            linkEl.rel = relation;
            this._appendElementToHead(linkEl);
        }

        const url = this._getAbsoluteUrl(this._canonicalPath);
        if (linkEl.href !== url)
            linkEl.href = url;
    }

    _getAbsoluteUrl(relativePath) {
        const path = relativePath.endsWith('/') ? 
            relativePath.substr(0, relativePath.length - 1) : relativePath;
        return this._getRootPath() + path;
    }

    _getRootPath() { return location.origin; }

    _appendElementToHead(elem) {
        document.head.appendChild(elem);
    }

    setMetaRobots() {
        const robotsMetaTagName = 'robots';
        let meta = this._getMetaTagByName(robotsMetaTagName);

        if (this._preventRobots) {
            if (meta)
                return;

            meta = document.createElement('meta');
            meta.name = robotsMetaTagName;
            meta.content = 'noindex, nofollow';
            this._appendElementToHead(meta);
        }
        else if (meta)
            meta.remove();
    }

    setStructuredData() {
        const structuredDataType = 'application/ld+json';
        let script = document.querySelector(`script[type="${structuredDataType}"]`);
        
        if (this._preventRobots && script)
            return script.remove();

        if (!script) {
            script = document.createElement('script');
            script.type = structuredDataType;
            this._appendElementToHead(script);
        }

        script.textContent = this._getPageStructure();
    }

    _getPageStructure() {
        const rootUrl = this._getRootPath();

        return `[{
            "@context":"http://schema.org",
            "@type":"Organization",
            "name":"Web Timer",
            "url":"${rootUrl}",
            "logo":"${this._getAbsoluteUrl('/resources/images/favicon.svg')}"
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "${rootUrl}"
            },{
                "@type": "ListItem",
                "position": 2,
                "name": "${this._name}",
                "item": "${location.href}"
            }]
        }]`;
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

        this._descriptor.setStructuredData();
        this._descriptor.setMetaDescription();
        this._descriptor.setTitle();
        this._descriptor.setCanonicalLink();
        this._descriptor.setMetaRobots();
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
