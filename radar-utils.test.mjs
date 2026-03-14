import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

async function loadRadarUtils() {
    try {
        return require('./radar-utils.js');
    } catch (error) {
        assert.fail('Expected radar-utils.js to exist and export minimap helpers.');
    }
}

test('worldToMinimapPoint maps the arena origin to the center of the radar', async () => {
    const { worldToMinimapPoint } = await loadRadarUtils();

    const point = worldToMinimapPoint(
        { x: 0, z: 0 },
        {
            worldMin: -170,
            worldMax: 170,
            size: 180,
            padding: 18
        }
    );

    assert.deepEqual(point, { x: 90, y: 90 });
});

test('worldToMinimapPoint clamps units outside the arena to the radar edge', async () => {
    const { worldToMinimapPoint } = await loadRadarUtils();

    const point = worldToMinimapPoint(
        { x: 500, z: -500 },
        {
            worldMin: -170,
            worldMax: 170,
            size: 180,
            padding: 18
        }
    );

    assert.deepEqual(point, { x: 162, y: 18 });
});
