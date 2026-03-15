(function(root, factory) {
    var api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    root.CrossfireHud = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    function isHudToggleKey(code) {
        return code === 'KeyQ';
    }

    function toggleHudVisibilityState(isVisible) {
        return !isVisible;
    }

    return {
        isHudToggleKey: isHudToggleKey,
        toggleHudVisibilityState: toggleHudVisibilityState
    };
});
