class Animation {
    constructor(elemId) {
        this._elemId = elemId;
        this._elem = null;
    }

    async blink() {
        await this._applyClass('fadeOut', 1);
        
        await this._applyClass('fadeIn');

        await this._reset();
    }

    _applyClass(className, msDelay = 1000) {
        return this._delay(() => {
            this._element.classList.add(className);
        }, msDelay);
    }

    _delay(callback, msDelay = 1000) {
        return new Promise(resolve => {
            setTimeout(() => {
                callback();
                resolve();
            }, msDelay);
        });
    }

    get _element() {
        if (!this._elem)
            this._elem = document.getElementById(this._elemId);

        return this._elem;
    }

    _reset() {
        return this._delay(() => this._element.className = '', 100);
    }
}

export { Animation };
