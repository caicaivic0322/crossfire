import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function loadHudUtils() {
    try {
        return require('./hud-utils.js');
    } catch (error) {
        assert.fail('Expected hud-utils.js to exist and export HUD toggle helpers.');
    }
}

test('isHudToggleKey only matches the Q shortcut', () => {
    const { isHudToggleKey } = loadHudUtils();

    assert.equal(isHudToggleKey('KeyQ'), true);
    assert.equal(isHudToggleKey('KeyR'), false);
    assert.equal(isHudToggleKey(''), false);
});

test('toggleHudVisibilityState flips the current HUD state', () => {
    const { toggleHudVisibilityState } = loadHudUtils();

    assert.equal(toggleHudVisibilityState(true), false);
    assert.equal(toggleHudVisibilityState(false), true);
});
