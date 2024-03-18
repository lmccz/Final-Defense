import StateMachine from "../../system/stateMachine.js";
import { SteeringBehaviors } from "../../system/steering.js";


export const BasicEnemyConfig = {
    'eye': {
        idleAnims: 'eye_anims', walkAnims: 'eye_anims', shadowy: 8, atk: 1, hp: 6, speed: 66, range: 56, sw: 8, sh: 8, cd: 3000, attack: (e, target) =>
        {
            const angle = Phaser.Math.Angle.BetweenPoints(e, target);
            e.scene.tweens.add({
                targets: e,
                scale: { from: 1, to: 1.2 },
                alpha: { from: 1, to: 0.6 },
                yoyo: true,
                ease: 'sine.inout',
                duration: 160,
                onYoyo: () =>
                {
                    e.scene.events.emit('enemy_projectile', { x: e.x, y: e.y, angle, id: 0, atk: e.atk })
                },
                onComplete: () =>
                {
                    e.fsm.transition('find');
                }
            })
        }
    },
    'bat': {
        idleAnims: 'bat_anims', walkAnims: 'bat_anims', shadowy: 8, atk: 1, hp: 6, speed: 36, range: 56, sw: 8, sh: 8, cd: 8000, attack: (e, target) =>
        {
            const angle = Phaser.Math.Angle.BetweenPoints(e, target);
            e.scene.physics.velocityFromRotation(angle, e.speed * 6, e.body.velocity);

            e.scene.tweens.add({
                targets: e,
                scaleX: { from: 1, to: 1.2 },
                scaleY: { from: 1, to: 0.8 },
                alpha: { from: 1, to: 0.6 },
                rotation: { from: 0, to: angle },
                yoyo: true,
                ease: 'sine.inout',
                duration: 160,
                onUpdate: () =>
                {
                    e.scene.events.emit('fx_pathParticle', { x: e.x, y: e.y });
                    e.scene.physics.overlap(e.scene.player.container, e, (p, e) =>
                    {
                        e.scene.player.takeDamage(e.atk)
                    });
                },
                onComplete: () =>
                {
                    e.body.setVelocity(0, 0);
                    e.fsm.transition('find');
                }
            })
        }
    },
}


class FindState
{
    timer = 0;
    enter(e)
    {
        e.walk();
        this.timer = BasicEnemyConfig[e.name].cd;
        this.clockwise = Math.random() >= 0.5 ? true : false;
    }

    execute(t, d, e)
    {
        const steeringForce = SteeringBehaviors.orbit(e, e.scene.player.container, 8, this.clockwise)
        e.body.setVelocity(steeringForce.x * e.speed, steeringForce.y * e.speed);

        this.timer -= d;
        if (this.timer > 0) return;

        const target = e.scene.enemyGetRangeTarget(e.x, e.y, 9999);
        // const index = e.scene.enemyManager.objectPool.children.entries.findIndex(c => c === e);
        const angle = (Math.random() * 5 >> 0) * (Math.PI * 2 / e.scene.enemyManager.objectPool.getLength());
        const x = target.x + Math.cos(angle) * 12;
        const y = target.y + Math.sin(angle) * 12;
        e.fsm.transition('move', { x, y });
    }
}


class MoveState
{
    x = 0;
    y = 0;
    timer = 4000;
    enter(e, { x, y })
    {
        this.x = x;
        this.y = y;
        this.timer = 4000;
        let from = -1;
        let to = 1;
        if (e.x < this.x) { from = 1; to = -1; }

        e.walk();
        e.flipAnims(from, to);
        e.scene.physics.moveTo(e, this.x, this.y, e.speed);
    }

    execute(t, d, e)
    {
        this.timer -= d;

        if (this.timer <= 0)
        {
            e.fsm.transition('find');
            return;
        }

        e.setDepth(3 + e.y >> 0);

        const distance = Phaser.Math.Distance.BetweenPoints(e, { x: this.x, y: this.y });

        if (distance <= e.range)
        {
            e.fsm.transition('attack');
            return;
        }
    }
}


class AttackState
{
    enter(e)
    {
        const target = e.scene.enemyGetRangeTarget(e.x, e.y, e.range);
        if (!target)
        {
            e.fsm.transition('find');
            return
        }
        e.attack(target);
    }
    execute(t, d, e) { }
}


class DamageState
{
    enter(e, v) { e.damage(v); }
    execute(t, d, e) { }
}


class DieState
{
    enter(e) { e.die(); }
    execute(t, d, e) { }
}


export class BasicEnemy extends Phaser.GameObjects.Sprite
{

    hp = 0;
    atk = 1;
    speed = 16;
    range = 16;
    flipAnimsing = false;
    shadowy = 0;

    constructor(scene)
    {
        super(scene, 0, 0);

        this.name = 'eye';
        this.scene.physics.world.enable(this);
        this.setPipeline('Light2D');

        this.body.setCollideWorldBounds(true);
        this.body.pushable = false;
        // this.light = scene.lights.addLight(0, 0, 64, 0x333333, 1);
        // this.light.setVisible(false);

        this.shadow = scene.add.sprite(0, 0, '');
        this.shadow.setAlpha(0.3);
        this.shadow.setTint(0x000000);
        this.shadow.setFlipY(true);
        this.shadow.setActive(false);
        this.shadow.setVisible(false);

        // this.scene.rexOutlinePipeline.add(this, { thickness: 1, outlineColor: 0xff568f });

        this.fsm = new StateMachine('find', {
            'find': new FindState,
            'move': new MoveState,
            'attack': new AttackState,
            'damage': new DamageState,
            'die': new DieState,
        }, [this]);
    }

    init({ x, y, name })
    {
        const { hp, atk, speed, range, sw, sh, shadowy } = BasicEnemyConfig[name];
        this.name = name;
        this.hp = hp;
        this.atk = atk;
        this.range = range
        this.speed = 3 + Math.random() * speed >> 0;
        this.shadowy = shadowy;

        this.body.setEnable(true);
        this.body.setSize(sw, sh);
        this.body.setOffset(this.body.width / 2, this.body.height / 2);
        // this.light.setVisible(true);
        // this.body.pushable = false;

        // this.shadow.setTexture(texture);
        this.shadow.setPosition(x, y);
        this.shadow.setActive(true);
        this.shadow.setVisible(true);

        this.setPosition(x, y);
        this.setDepth(y >> 0);
        this.setActive(true);
        this.setVisible(true);
        this.fsm.transition('find');
    }

    walk()
    {
        this.anims.play(BasicEnemyConfig[this.name].walkAnims, true);
        this.shadow.anims.play(BasicEnemyConfig[this.name].walkAnims, true);
    }

    flipAnims(from, to)
    {
        if (this.flipAnimsing || this.scaleX === to) return;
        this.flipAnimsing = true;

        this.scene.tweens.add({
            targets: [this, this.shadow],
            duration: 300,
            scaleY: { from: 0.8, to: 1 },
            scaleX: { from, to },
            onComplete: () =>
            {
                this.flipAnimsing = false;
            }
        })
    }

    attack(target)
    {
        this.body.setVelocity(0, 0);
        this.anims.play(BasicEnemyConfig[this.name].idleAnims, true);
        this.shadow.anims.play(BasicEnemyConfig[this.name].idleAnims, true);
        BasicEnemyConfig[this.name].attack(this, target);
    }

    damage(v)
    {
        this.setTintFill(0xffffff);
        this.scene.tweens.add({
            targets: this,
            duration: 120,
            yoyo: true,
            ease: 'sine.inout',
            scale: { from: 1, to: 2 },
            rotation: { from: 0, to: 0.8 },
            onComplete: () =>
            {
                this.clearTint();
                this.fsm.transition('find');
            }
        })
    }

    takeDamage(v)
    {
        const state = this.fsm.getState();
        if (state === 'die' || state === 'damage') return;

        this.hp -= v;
        const { x, y } = this;

        this.scene.cameras.main.shake(360, 0.014);
        this.scene.sound.play('dash');
        // this.scene.events.emit('fx_ray', { x, y });
        this.scene.events.emit('fx_damage_value', { x, y, v });
        this.scene.events.emit('fx_damage_particle', { x, y });

        if (this.hp <= 0) this.fsm.transition('die');
        else this.fsm.transition('damage', v);
    }

    die()
    {
        this.shadow.setActive(false);
        this.shadow.setVisible(false);
        this.scene.sound.play('rumble');
        // this.light.setVisible(false);
        this.scene.events.emit('fx_crit');
        this.scene.events.emit('drop_item', { x: this.x, y: this.y });
        this.scene.events.emit('fx_explode', { x: this.x, y: this.y, count: 26, range: 56 });
        this.scene.events.emit('enemy_die', this);
    }

    update(t, d)
    {
        this.fsm.step(t, d);
        // this.light.setPosition(this.x, this.y);
        this.shadow.setPosition(this.x, this.y + this.shadowy);
    }
}