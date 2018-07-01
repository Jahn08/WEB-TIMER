const EventHelper = function(vueVar, eventName) {
    const _addEventListener = (_eventName, callback) => vueVar.$on(_eventName, callback);
    const _removeEventListener = (_eventName, callback) => vueVar.$off(_eventName, callback);
    const _emitEvent = (_eventName, args) => vueVar.$emit(_eventName, args);

    this.addListener = function(callback) {
        _addEventListener(eventName, callback);
    };
    this.removeListener = function(callback) {
        _removeEventListener(eventName, callback);
    };
    this.removeAllListeners = function() {
        _removeEventListener(eventName);
    };
    this.emitEvent = function(args) {
        _emitEvent(eventName, args);
    };
};

const vm = new Vue();       

const watchKeyDownEventHelper = new EventHelper(vm, 'watchKeyDown');
const authEventHelper = new EventHelper(vm, 'authenticated');

export { watchKeyDownEventHelper, authEventHelper };