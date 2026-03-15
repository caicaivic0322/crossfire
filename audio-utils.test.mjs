import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function loadAudioUtils() {
    try {
        return require('./audio-utils.js');
    } catch (error) {
        assert.fail('Expected audio-utils.js to exist and export procedural audio helpers.');
    }
}

test('shouldTriggerFootstep only fires when grounded, moving, and the step interval elapsed', () => {
    const { shouldTriggerFootstep } = loadAudioUtils();

    assert.equal(
        shouldTriggerFootstep({
            isMoving: true,
            isGrounded: true,
            isReloading: false,
            now: 1200,
            lastStepTime: 700,
            stepInterval: 320
        }),
        true
    );

    assert.equal(
        shouldTriggerFootstep({
            isMoving: true,
            isGrounded: false,
            isReloading: false,
            now: 1200,
            lastStepTime: 700,
            stepInterval: 320
        }),
        false
    );

    assert.equal(
        shouldTriggerFootstep({
            isMoving: true,
            isGrounded: true,
            isReloading: true,
            now: 1200,
            lastStepTime: 700,
            stepInterval: 320
        }),
        false
    );
});

test('getWeaponAudioProfile returns weapon-specific reload pattern and falls back to pistol', () => {
    const { getWeaponAudioProfile } = loadAudioUtils();

    const shotgunProfile = getWeaponAudioProfile('shotgun');
    const fallbackProfile = getWeaponAudioProfile('unknown');

    assert.deepEqual(shotgunProfile.reloadPattern, [0.14, 0.32, 0.56, 0.82]);
    assert.equal(shotgunProfile.shot.noiseAmount > fallbackProfile.shot.noiseAmount, true);
    assert.equal(fallbackProfile.name, 'pistol');
});
