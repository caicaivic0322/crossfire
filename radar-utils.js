(function(root, factory) {
    var api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    root.CrossfireRadar = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function normalize(value, min, max) {
        if (max === min) {
            return 0.5;
        }

        return clamp((value - min) / (max - min), 0, 1);
    }

    function worldToMinimapPoint(position, options) {
        var size = options.size;
        var padding = options.padding;
        var worldMin = options.worldMin;
        var worldMax = options.worldMax;
        var innerSize = size - padding * 2;

        var x = padding + normalize(position.x, worldMin, worldMax) * innerSize;
        var y = padding + normalize(position.z, worldMin, worldMax) * innerSize;

        return {
            x: Math.round(x),
            y: Math.round(y)
        };
    }

    function getHeadingVector(yaw, length) {
        return {
            x: Math.sin(yaw) * length,
            y: -Math.cos(yaw) * length
        };
    }

    return {
        clamp: clamp,
        worldToMinimapPoint: worldToMinimapPoint,
        getHeadingVector: getHeadingVector
    };
});
