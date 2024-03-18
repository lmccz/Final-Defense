import { Rand } from "../../system/utils";

const distance = new Phaser.Math.Vector2();
const force = new Phaser.Math.Vector2();
const acceleration = new Phaser.Math.Vector2();


export const Weapon = {
    'sword': {
        texture: 'sword2',
        atk: 4,
        action: [
            { angle: -66, flipY: false, texture: 'slice', timeout: 260, speed: 26 },
            { angle: 86, flipY: true, texture: 'slice', timeout: 260, speed: 26 },
            { angle: 0, flipY: false, texture: 'slash_3', timeout: 260, speed: 46 }
        ],
        enterIdle: e =>
        {
            e.equipSprite.setVisible(false);
            e.equipSprite.setVisible(false);
        },
        executeIdle: e =>
        {
            if (!e.keydown) return;
            e.fsm.transition('action', 0);
        },
        enterAction: (e, stateMachine) =>
        {
            const stateIndex = stateMachine.stateIndex;
            const { atk, action } = Weapon['sword'];
            const { angle, flipY, texture, timeout, speed } = action[stateIndex];
            // const v = e.character.container.scaleX // === 1 ? -26 : 26;
            const newAngle = 180 + angle + e.pointerAngle;

            e.character.container.body.setVelocity(Math.cos(e.radian) * speed, Math.sin(e.radian) * speed);
            e.character.walk();

            e.slice.setTexture(texture);
            e.equipSprite.setVisible(true);
            e.slice.setVisible(true);

            e.equipSprite.setAngle(newAngle);
            e.slice.setAngle(180 + e.pointerAngle);
            e.slice.setFlipY(flipY);

            e.character.scene.sound.play('bow_shoot');
            e.character.scene.tweens.add({
                targets: [e.equipSprite, e.slice],
                duration: timeout,
                ease: 'sine.inout',
                scale: { from: 1, to: 1.3 },
                alpha: { from: 1, to: 0 },
                onComplete: () =>
                {
                    e.equipSprite.setVisible(false);
                    e.slice.setVisible(false);
                    // 击退
                    e.character.scene.physics.overlap(e.body, e.character.scene.enemyManager.objectPool, (a, b) =>
                    {
                        distance.copy(b.body.center).subtract(a);
                        force.copy(distance).setLength(distance.lengthSq()).limit(30);
                        acceleration.copy(force).scale(1 / b.body.mass);
                        b.body.velocity.add(acceleration);
                        b.takeDamage(atk);
                    });

                    e.character.scene.physics.overlap(e.body, e.character.scene.enemyManager.bossPool, (a, b) =>
                    {
                        b.takeDamage(atk);
                    });

                    stateMachine.action = false;
                    e.character.idle();
                }
            });
        },
        executeAction: (e, stateMachine) =>
        {
            // e.character.idle();
            if (!e.keydown) return;
            stateMachine.stateIndex += 1;
            if (stateMachine.stateIndex >= Weapon['sword'].action.length) stateMachine.stateIndex = 0;
            e.fsm.transition('action', stateMachine.stateIndex);
        },
    },
    'bow': {
        texture: 'bowIcon',
        atk: 10,
        enterIdle: e =>
        {
            e.equipSprite.setVisible(false);
        },
        executeIdle: e =>
        {
            if (!e.keydown) return;
            e.fsm.transition('action', 0);
        },
        enterAction: (e, stateMachine) =>
        {
            const atk = Weapon['bow'].atk;

            e.character.container.body.setVelocity(Math.cos(e.radian) * -30, Math.sin(e.radian) * -30);
            e.character.walk();
            e.equipSprite.setAngle(180 + e.pointerAngle);
            e.equipSprite.setVisible(true);
            e.character.scene.sound.play('bow_shoot');

            e.character.scene.tweens.add({
                targets: e.equipSprite,
                duration: 160,
                ease: 'sine.inout',
                alpha: { from: 1, to: 0.4 },
                scaleX: { from: 1, to: 1.6 },
                scaleY: { from: 1, to: 0.4 },
                onComplete: () =>
                {
                    e.character.idle();
                    e.character.scene.events.emit('start_player_projectile', { x: e.equipSprite.x, y: e.equipSprite.y, angle: e.radian, atk, id: 2 });
                    e.equipSprite.setVisible(false);
                    stateMachine.action = false;
                    e.fsm.transition('idle');
                }
            });
        },
        executeAction: (e, stateMachine) =>
        {
            if (!e.keydown) return;
            e.fsm.transition('idle');
        },
    },
    'spear': {
        texture: 'spear',
        atk: 12,
        enterIdle: e =>
        {
            e.equipSprite.setVisible(false);
        },
        executeIdle: e =>
        {
            if (!e.keydown) return;
            e.fsm.transition('action', 0);
        },
        enterAction: (e, stateMachine) =>
        {
            const atk = Weapon['spear'].atk;

            e.character.container.body.setVelocity(Math.cos(e.radian) * -30, Math.sin(e.radian) * -30);
            e.character.walk();

            e.equipSprite.setAngle(180 + e.pointerAngle);
            e.equipSprite.setVisible(true);

            e.character.scene.sound.play('bow_shoot');
            e.character.scene.tweens.add({
                targets: e.equipSprite,
                duration: 160,
                ease: 'sine.inout',
                alpha: { from: 1, to: 0.6 },
                scaleX: { from: 1, to: 1.6 },
                scaleY: { from: 1, to: 0.8 },
                yoyo: true,
                onYoyo: () =>
                {
                    // 击退
                    e.character.scene.physics.overlap(e.body, e.character.scene.enemyManager.objectPool, (a, b) =>
                    {
                        distance.copy(b.body.center).subtract(a);
                        force.copy(distance).setLength(distance.lengthSq()).limit(68);
                        acceleration.copy(force).scale(1 / b.body.mass);
                        b.body.velocity.add(acceleration);
                        b.takeDamage(atk);
                    });

                    e.character.scene.physics.overlap(e.body, e.character.scene.enemyManager.bossPool, (a, b) =>
                    {
                        b.takeDamage(atk);
                    });
                },
                onComplete: () =>
                {
                    e.character.idle();
                    e.equipSprite.setVisible(false);
                    stateMachine.action = false;
                    e.fsm.transition('idle');
                }
            });
        },
        executeAction: (e, stateMachine) =>
        {
            if (!e.keydown) return;
            e.fsm.transition('idle');
        },
    }
}


export const Abilites = {
    'range_spread': {
        texture: "grass",
        frame: 0,
        start: system =>
        {
            const player = system.character.container;
            const range = 60;
            const scene = system.character.scene;
            const circle = scene.fxManager.circle;
            // fx
            circle.setVisible(true);
            circle.setActive(true);
            circle.setPosition(player.x, player.y);

            scene.tweens.add({
                targets: circle,
                duration: 360,
                radius: { from: 1, to: range },
                alpha: { from: 1, to: 0 },
                ease: 'sine.inout',
                onComplete: () =>
                {
                    circle.setVisible(false);
                    circle.setActive(false);

                    scene.enemyManager.objectPool.children.entries.forEach(e =>
                    {
                        if (e.active && e.hp > 0 && Phaser.Math.Distance.BetweenPoints(e, player) <= range)
                        {
                            e.takeDamage(1);

                            distance.copy(e.body.center).subtract(player);
                            force.copy(distance).setLength(distance.lengthSq()).limit(168);
                            acceleration.copy(force).scale(1 / e.body.mass);
                            e.body.velocity.add(acceleration);

                            scene.events.emit('fx_free_sprite', { x: e.x, y: e.y, anims: 'flame_spread_explosion_anims' })
                        }
                    });

                    scene.enemyManager.bossPool.children.entries.forEach(e =>
                    {
                        if (e.active && e.hp > 0 && Phaser.Math.Distance.BetweenPoints(e, player) <= range)
                        {
                            e.takeDamage(3);
                            scene.events.emit('fx_free_sprite', { x: e.x, y: e.y, anims: 'flame_spread_explosion_anims' })
                        }
                    });
                }
            })
        }
    },
    'projectile': {
        texture: 'fireball',
        frame: 0,
        start: system =>
        {
            const angle = system.radian;
            const { x, y } = system.character.container;
            const target = system.character.scene.enemyManager.objectPool.children.entries.find(e => e.active);
            system.scene.events.emit('start_player_projectile', { x, y, angle, atk: 1, id: 1, target });
        }
    },
    'arbitrary': {
        texture: 'fireball',
        frame: 0,
        start: system =>
        {
            const { x, y, scaleX } = system.character.container;
            const flipX = scaleX === 1 ? true : false;
            system.scene.events.emit('fx_arbitrary', { x, y, flipX });
        }
    },
    'lightning': {
        texture: 'fireball',
        frame: 0,
        start: system =>
        {
            const enemys = system.character.scene.enemyManager.objectPool.children.entries;
            const p = system.character.container;
            const target = enemys.find(e => e.active && Phaser.Math.Distance.BetweenPoints(p, e) <= 86);

            if (target)
            {
                target.takeDamage(1);
                system.scene.events.emit('lightning', {
                    startPoint: { x: p.x, y: p.y },
                    endPoint: { x: target.x, y: target.y },
                    timeout: 300
                });
            }
        },
    },
    'splash': {
        texture: 'fireball',
        frame: 0,
        cd: 2000,
        range: 26,
        start: system =>
        {
            const enemys = system.character.scene.enemyManager.objectPool.children.entries;
            const p = system.character.container;
            const sprites = system.character.scene.fxManager.sprites;
            const circle = system.character.scene.fxManager.circleStroke;
            const x = Rand(p.x - 35, p.x + 35);
            const y = Rand(p.y - 35, p.y + 35);
            const sprite = sprites.get();

            if (!sprite) return;

            circle.setVisible(true);
            circle.setActive(true);
            circle.setPosition(x, y);

            sprite.scene.tweens.add({
                targets: circle,
                duration: 460,
                alpha: { from: 0.6, to: 0 },
                radius: { from: 0, to: 24 },
                onComplete: () =>
                {
                    sprite.scene.events.emit('fx_explode', { x, y, count: 36, range: 36 });

                    enemys.forEach(e =>
                    {
                        if (e.active && Phaser.Math.Distance.BetweenPoints(e, { x, y }) <= 24)
                        {
                            e.takeDamage(1)
                        }
                    });

                    circle.setVisible(false);
                    circle.setActive(false);
                }
            });

            sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
            {
                sprite.setOrigin(0.5, 0.5);
                sprites.killAndHide(sprite);
            });

            sprite.anims.play('splash_anims', true);
            sprite.clearTint();
            sprite.setAlpha(1);
            sprite.setRotation(0);
            sprite.setScale(1);
            sprite.setOrigin(0.8, 1);
            sprite.setFlipX(false);
            sprite.setDepth(y >> 0);
            sprite.setPosition(x, y);
            sprite.setVisible(true);
            sprite.setActive(true);
        },
    }
}