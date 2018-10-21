function RouteFormState(route) {
    const meta = route.meta;

    this.isDirty = () => meta.isDirty == true;

    this.makeDirty = () => meta.isDirty = true;

    this.makePure = () => meta.isDirty = false;
};

RouteFormState.constructFromScope = (vueScope) => new RouteFormState(vueScope.$router.currentRoute);

export default RouteFormState;