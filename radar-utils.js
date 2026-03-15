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

    function rotateRelativePosition(relative, yaw) {
        var cos = Math.cos(yaw || 0);
        var sin = Math.sin(yaw || 0);

        return {
            x: relative.x * cos - relative.z * sin,
            z: relative.x * sin + relative.z * cos
        };
    }

    function projectWorldToRadarPoint(position, focus, options) {
        var size = options.size;
        var padding = options.padding;
        var range = options.range;
        var center = size / 2;
        var radius = center - padding;
        var relative = {
            x: position.x - focus.x,
            z: position.z - focus.z
        };
        var rotated = rotateRelativePosition(relative, options.yaw || 0);
        var normalizedX = rotated.x / range;
        var normalizedZ = rotated.z / range;
        var clampedX = clamp(normalizedX, -1, 1);
        var clampedZ = clamp(normalizedZ, -1, 1);

        return {
            x: Math.round(center + clampedX * radius),
            y: Math.round(center + clampedZ * radius),
            clamped: clampedX !== normalizedX || clampedZ !== normalizedZ
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
        rotateRelativePosition: rotateRelativePosition,
        projectWorldToRadarPoint: projectWorldToRadarPoint,
        getHeadingVector: getHeadingVector
    };
});
