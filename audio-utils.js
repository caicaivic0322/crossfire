(function(root, factory) {
    var api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    root.CrossfireAudio = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    var weaponProfiles = {
        pistol: {
            name: 'pistol',
            reloadPattern: [0.18, 0.48, 0.78],
            shot: { wave: 'triangle', startFrequency: 190, endFrequency: 80, decay: 0.16, noiseAmount: 0.24 }
        },
        rifle: {
            name: 'rifle',
            reloadPattern: [0.12, 0.24, 0.46, 0.74],
            shot: { wave: 'sawtooth', startFrequency: 150, endFrequency: 68, decay: 0.2, noiseAmount: 0.34 }
        },
        shotgun: {
            name: 'shotgun',
            reloadPattern: [0.14, 0.32, 0.56, 0.82],
            shot: { wave: 'square', startFrequency: 108, endFrequency: 46, decay: 0.3, noiseAmount: 0.58 }
        },
        sniper: {
            name: 'sniper',
            reloadPattern: [0.16, 0.38, 0.7, 0.9],
            shot: { wave: 'triangle', startFrequency: 84, endFrequency: 32, decay: 0.42, noiseAmount: 0.28 }
        }
    };

    function cloneProfile(profile) {
        return {
            name: profile.name,
            reloadPattern: profile.reloadPattern.slice(),
            shot: {
                wave: profile.shot.wave,
                startFrequency: profile.shot.startFrequency,
                endFrequency: profile.shot.endFrequency,
                decay: profile.shot.decay,
                noiseAmount: profile.shot.noiseAmount
            }
        };
    }

    function shouldTriggerFootstep(options) {
        if (!options.isMoving) return false;
        if (!options.isGrounded) return false;
        if (options.isReloading) return false;
        return options.now - options.lastStepTime >= options.stepInterval;
    }

    function getWeaponAudioProfile(weaponName) {
        return cloneProfile(weaponProfiles[weaponName] || weaponProfiles.pistol);
    }

    return {
        shouldTriggerFootstep: shouldTriggerFootstep,
        getWeaponAudioProfile: getWeaponAudioProfile
    };
});
