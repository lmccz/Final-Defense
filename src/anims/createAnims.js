import { SKINS } from "../constant.js";


export const CreateAnims = anims =>
{
    for (let i = 0; i < SKINS.length; i++)
    {
        anims.create({ key: `${SKINS[i]}_right_anims`, frames: anims.generateFrameNumbers(SKINS[i], { start: 0, end: 6 }), repeat: -1, frameRate: 8, });
        anims.create({ key: `${SKINS[i]}_left_anims`, frames: anims.generateFrameNumbers(SKINS[i], { start: 7, end: 19 }), repeat: -1, frameRate: 8, });
    }

    anims.create({ key: 'catIdleAnims', frames: anims.generateFrameNumbers('cat_1', { start: 8, end: 11 }), repeat: -1, frameRate: 6, });
    anims.create({ key: 'catWalkAnims', frames: anims.generateFrameNumbers('cat_1', { start: 12, end: 15 }), repeat: -1, frameRate: 6, });
    anims.create({ key: 'eye_anims', frames: anims.generateFrameNumbers('eye', { start: 0, end: 3 }), repeat: -1, frameRate: 16 });
    anims.create({ key: 'bat_anims', frames: anims.generateFrameNumbers('bat', { start: 0, end: 1 }), repeat: -1, frameRate: 6 });
    anims.create({ key: 'coin_anims', frames: anims.generateFrameNumbers('coin', { start: 0, end: 3 }), repeat: -1, frameRate: 8 });
    anims.create({ key: 'heart_anims', frames: anims.generateFrameNumbers('heart', { start: 0, end: 3 }), repeat: -1, frameRate: 8 });
    anims.create({ key: 'cloak_anims', frames: anims.generateFrameNumbers('cloak', { start: 0, end: 12 }), repeat: -1, frameRate: 8 });

    anims.create({ key: 'spirit_idle_anims', frames: anims.generateFrameNumbers('GiantSpirit', { start: 0, end: 4 }), repeat: -1, frameRate: 8 });
    anims.create({ key: 'arbitrary_anims', frames: anims.generateFrameNames('arbitrary', { prefix: 'FX', start: 1, end: 15, }), frameRate: 18, });

    anims.create({ key: 'flame_spread_explosion_anims', frames: anims.generateFrameNames('flame-spread-explosion', { start: 0, end: 4, suffix: '.png', }), frameRate: 8, });
    anims.create({ key: 'splash_anims', frames: anims.generateFrameNumbers('splash', { start: 0, end: 10 }), frameRate: 10, repeat: 0 });
}