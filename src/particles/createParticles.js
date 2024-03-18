import { STAGE_HEIGHT, STAGE_WIDTH } from "../constant.js";
import Particles from "./particles.js";


// emitParticleAt(x,y) 不会锁死位置
// setPosition(x,y) 会


export const CreateParticles = () =>
{
    Particles.addEmitter('foggy', {
        x: -80,
        y: { min: -60, max: STAGE_HEIGHT },
        blendMode: 'ADD',
        tint: 0x222222,
        speedX: { min: 30, max: 40 },
        speedY: { min: -10, max: 20 },
        // alpha: 0.1,
        rotate: { start: 0, end: 360 },
        quantity: 1,
        frequency: 1000,
        lifespan: 20000,
    });

    Particles.addEmitter('phantom', {
        alpha: { start: 0.3, end: 0 },
        lifespan: 600,
        quantity: 1,
        tintFill: true,
        tint: 0xffffff,
        emitting: false
    });

    Particles.addEmitter('crush', {
        speed: { min: 20, max: 60 },
        alpha: { start: 0.6, end: 0 },
        scale: { start: 4, end: 0 },
        tint: { start: 0xfebe17, end: 0xff0000 },
        rotate: { start: 0, end: 360 },
        lifespan: 600,
        quantity: 6,
        blendMode: 'ADD',
        emitting: false
    });

    Particles.addEmitter('pathParticle', {
        speed: { min: 1, max: 3 },
        // frame: 2,
        alpha: { start: 0.4, end: 0 },
        scale: { start: 2, end: 0 },
        lifespan: 800,
        tint: { start: 0xfebe17, end: 0xff0000 },
        rotate: { start: 0, end: 360 },
        quantity: 1,
        frequency: 800,
        blendMode: 'ADD',
        emitting: false
    });

    Particles.addEmitter('walk', {
        alpha: { start: 0.4, end: 0 },
        speedX: { min: -3, max: 3 },
        speedY: { min: -16, max: 16 },
        rotate: { start: 0, end: 360 },
        blendMode: 'ADD',
        scale: { start: 0.6, end: 1.2 },
        quantity: 1,
        lifespan: 1200,
        emitting: false
    });

    Particles.addEmitter('bloody', {
        alpha: { start: 0, end: 0.6 },
        speedX: { min: -30, max: 30 },
        speedY: { min: -20, max: 6 },
        gravityY: 40,
        // blendMode: 'ADD',
        tint: 0xff0000,
        rotate: { min: 30, max: 330 },
        scale: { min: 1, max: 4 },
        quantity: 6,
        lifespan: 800,
        hold: 4600,
        sortProperty: 'lifeT',
        sortOrderAsc: true,
        emitting: false
    });

    Particles.addEmitter('RainOnFloor', {
        x: 0,
        y: 0,
        // speed: 0,
        gravityY: 0,
        quantity: 5,
        frequency: 80,
        lifespan: 1000,
        alpha: { start: 0.8, end: 0 },
        scale: { start: 1, end: .5 },
        emitZone: {
            type: 'random',
            source: new Phaser.Geom.Rectangle(0, 0, STAGE_WIDTH, STAGE_HEIGHT),
            quantity: 10,
            stepRate: 0,
            yoyo: false,
            seamless: true
        },
    });

    Particles.addEmitter('rain', {
        x: -30,
        y: 0,
        speedX: { min: -60, max: -80 },
        speedY: { min: 200, max: 400 },
        gravityY: 0,
        quantity: 26,
        frequency: 36,
        lifespan: 3000,
        alpha: { start: 0.68, end: 0 },
        // alpha: 0.25,
        emitZone: {
            type: 'random',
            source: new Phaser.Geom.Rectangle(0, 0, STAGE_WIDTH, STAGE_HEIGHT),
            quantity: 64,
            stepRate: 0,
            yoyo: false,
            seamless: true
        },
        // deathZone: {
        //     type: 'onEnter',
        //     source: new Phaser.Geom.Rectangle(916, 80, 224, 112)
        // }
    });
};