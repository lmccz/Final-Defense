import Particles from "../particles/particles.js";
import { LightningGenerator } from "./lightning.js";


const GraphicsDraw = {
    'line': (graphics, { color, alpha, lineWidth, x, y, tx, ty }) =>
    {
        graphics.lineStyle(lineWidth, color, alpha);
        graphics.beginPath();
        graphics.moveTo(x, y);
        graphics.lineTo(tx, ty);
        graphics.closePath();
        graphics.strokePath();
    }
}


export class FXManager
{
    scene;
    graphicsQueue = [];
    timer = 160;

    constructor(scene)
    {
        this.scene = scene;

        this.bitmapText = scene.add.group({ classType: Phaser.GameObjects.BitmapText, maxSize: 8 });

        this.graphics = this.scene.add.graphics();
        this.graphics.setDepth(999);

        this.lightningGenerator = new LightningGenerator(8, 30, 1);

        this.particles = new Particles(scene);
        this.particles.createParticleEmitter('foggy', [{ key: "foggy", texture: "smoke-puff", depth: 999 }]);
        this.particles.createParticleEmitter('phantom', [{ key: "phantom", texture: "phantom", depth: 6 }]);
        this.particles.createParticleEmitter('walk', [{ key: "walk", texture: "square", depth: 6 }]);
        this.particles.createParticleEmitter('bloody', [{ key: "bloody", texture: "white", depth: 2 }]);
        this.particles.createParticleEmitter('crush', [{ key: "crush", texture: "white", depth: 999 }]);
        this.particles.createParticleEmitter('pathParticle', [{ key: "pathParticle", texture: "white", depth: 3 }]);
        this.particles.createParticleEmitter('rain', [{ key: "RainOnFloor", texture: "RainOnFloor", depth: 4 }, { key: "rain", texture: "particles_rain", depth: 999 }]);
        this.particles.start('rain');
        this.particles.start('foggy');

        this.sprites = scene.add.group({ classType: Phaser.GameObjects.Sprite, maxSize: 36 });
        this.circle = scene.add.circle(0, 0, 1, 0xffffff, 1).setDepth(4).setVisible(false).setActive(false);
        this.circleStroke = scene.add.circle(0, 0, 1, 0xffffff, 1).setStrokeStyle(1, 0xff0000, 1).setDepth(4).setVisible(false).setActive(false);

        scene.events.on('lightning', this.lightning, this);
        scene.events.on('walk_particles', (x, y) => { this.particles.emitParticleAt('walk', x, y); });
        scene.events.on('fx_phantom', (x, y) => { this.particles.emitParticleAt('phantom', x, y); });
        scene.events.on('fx_graphics', (config) => { this.graphicsQueue.push(config) });
        scene.events.on('fx_pathParticle', ({ x, y }) => { this.particles.emitParticleAt('pathParticle', x, y); });
        scene.events.on('fx_damage_value', this.fxDamageValue, this);
        // scene.events.on('fx_ray', this.ray, this);
        scene.events.on('fx_arbitrary', this.arbitrary, this);
        scene.events.on('fx_free_sprite', this.freeSprite, this);
        scene.events.on('fx_explode', ({ x, y, count, range }) =>
        {
            while (count > 0)
            {
                this.particles.emitParticleAt('pathParticle', (-range / 2) + x + Math.random() * range, (-range / 2) + y + Math.random() * range);
                count -= 1;
            }
        });
        scene.events.on('fx_damage_particle', ({ x, y }) =>
        {
            this.particles.emitParticleAt('bloody', x, y);
            this.particles.emitParticleAt('crush', x, y);
        });
        scene.events.on('fx_crit', () =>
        {
            // if (Math.random() > 0.2) return

            scene.cameras.main.flash();
            scene.cameras.main.shake(120, 0.01);
            scene.tweens.add({
                targets: scene.cameras.main,
                zoom: { from: 1, to: 1.1 },
                ease: 'sine.inout',
                duration: 80,
                yoyo: true
            });
        });
    }

    lightning({ startPoint, endPoint, timeout = 300 })
    {
        this.graphics.clear();
        this.graphics.alpha = 1;

        const paths = this.lightningGenerator.generate(startPoint, endPoint);
        paths.forEach(s =>
        {
            if (s.level === 1) { this.graphics.lineStyle(1, 0xFFFFFF, 1) }
            else { this.graphics.lineStyle(1, 0xFFFFFF, 1 - s.level / 4) }

            this.graphics.beginPath();
            this.graphics.moveTo(s.startPoint.x, s.startPoint.y);
            this.graphics.lineTo(s.endPoint.x, s.endPoint.y);
            this.graphics.closePath();
            this.graphics.strokePath();
        });

        this.scene.tweens.add({
            targets: this.graphics,
            alpha: { from: 1, to: 0 },
            duration: timeout,
            delay: 160,
            onComplete: () =>
            {
                this.graphics.clear();
            }
        });
    }

    freeSprite({ x, y, anims })
    {
        const sprite = this.sprites.get();
        if (!sprite) return;

        sprite.anims.play(anims, true);
        sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
        {
            this.sprites.killAndHide(sprite);
        });

        sprite.setTintFill(0xffffff)
        sprite.setAlpha(1);
        sprite.setRotation(0);
        sprite.setScale(1);
        sprite.setFlipX(false);
        sprite.setDepth(y >> 0);
        sprite.setPosition(x, y);
        sprite.setVisible(true);
        sprite.setActive(true);
    }

    arbitrary({ x, y, flipX })
    {
        const sprite = this.sprites.get();
        if (!sprite) return;

        sprite.anims.play('arbitrary_anims', true);

        sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
        {
            this.sprites.killAndHide(sprite);
        });

        sprite.setTintFill(0xffffff)
        sprite.setAlpha(0.46);
        sprite.setRotation(0);
        sprite.setScale(1);
        sprite.setFlipX(flipX);
        sprite.setDepth(y >> 0);
        sprite.setPosition(x, y);
        sprite.setVisible(true);
        sprite.setActive(true);
    }

    fxDamageValue({ x, y, v })
    {
        const dv = this.bitmapText.get(x, y, 'fonts');
        if (!dv) return;

        const max = 26;
        const min = -26;
        const rx = Math.random() * (max - min) + min;
        const ry = Math.random() * max;

        dv.setDepth(999);
        dv.setText(v);
        dv.setFontSize(10);
        dv.setActive(true);
        dv.setVisible(true);
        dv.setTint(0xffffff);
        dv.setRotation(0);
        dv.setAlpha(1);
        dv.setPipeline('Light2D');

        this.scene.tweens.add({
            targets: dv,
            angle: { from: 0, to: -16 },
            alpha: { from: 1, to: 0 },
            x: `+=${rx}`,
            y: `-=${ry}`,
            // tint: { from: 0xffffff, to: 0xff0000 },
            ease: 'sine.inout',
            duration: 1600,
            onComplete: () =>
            {
                this.bitmapText.killAndHide(dv);
            },
        });
    }
}