function EventBus()
{
    const vm = new Vue();

    const watchKeyDownEventName = 'watchKeyDown';
    this.addWatchKeyDownListener = function(callback) {
        vm.$on(watchKeyDownEventName, callback);
    };

    this.removeWatchKeyDownListener = function(callback) {
        vm.$off(watchKeyDownEventName, callback);
    };

    this.removeAllWatchKeyDownListeners = function() {
        vm.$off(watchKeyDownEventName);
    };

    this.emitWatchKeyDownEvent = function(args) {
        vm.$emit(watchKeyDownEventName, args);
    };
};

const eventBus = new EventBus();
export default eventBus;