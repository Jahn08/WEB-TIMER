class Prerenderer {
    static get isPrerendering() { return window.__PRERENDER_INJECTED == true; }

    static finalise(appElemId) {
        if (this.isPrerendering) {
            const appElem = document.getElementById(appElemId);
            appElem.dataset.serverRendered = true;

            document.dispatchEvent(new Event('render-event'));
        }
    }
}

export { Prerenderer };