import { MINION_MAX_COUNT } from "../../constant.js";
import { Blackboard } from "../../system/behaviorTree/blackboard.js";
import { SelectorNode } from "../../system/behaviorTree/selectorNode.js";
import { SequenceNode } from "../../system/behaviorTree/sequenceNode.js";
import StateMachine from "../../system/stateMachine.js";
import { SteeringBehaviors } from "../../system/steering.js";
import { Rand } from "../../system/utils.js";
import { CheckMinionLow } from "./behavior/checkMinionLow.js";
import { ExecuteAbility } from "./behavior/executeAbility.js";
import { IsAction } from "./behavior/isAction.js";
import { IsFar } from "./behavior/isFar.js";
import { MovetoTarget } from "./behavior/movetoTarget.js";
import { SelectAbility } from "./behavior/selectAbility.js";
import { SpawnMinion } from "./behavior/spawnMinion.js";


const BossConfig = {
    'Spirit': { abilities: ['Dash', 'Anger'], idleAnims: 'spirit_idle_anims', walkAnims: 'spirit_idle_anims', hp: 200, speed: 46, atk: 1, range: 88, sw: 30, sh: 30 }
}


const Abilities = {
    'SpawnMinion': e =>
    {
        let count = MINION_MAX_COUNT - e.scene.enemyManager.objectPool.getTotalUsed();
        // if (count >= 5) count = 5;

        e.scene.tweens.add({
            targets: e,
            alpha: { from: 1, to: 0.6 },
            scale: { from: 1, to: 1.2 },
            yoyo: true,
            ease: 'sine.inout',
            duration: 160,
            onComplete: () =>
            {
                while (count > 0)
                {
                    const key = Math.random() > 0.5 ? 'eye' : 'bat';
                    count -= 1;
                    e.scene.events.emit('fx_pathParticle', { x: e.x, y: e.y });
                    e.scene.enemyManager.spawn(e.x, e.y, key);
                }
                e.fsm.transition('wander');
            }
        })
    },
    'Dash': e =>
    {
        // const angle = Phaser.Math.Angle.BetweenPoints(e, e.scene.player.container);
        // e.scene.physics.velocityFromRotation(angle, e.speed * 6, e.body.velocity);
        // 直线冲刺
        const v = e.x > e.scene.player.container.x ? -1 : 1;
        e.body.setVelocity(v * e.speed * 6, 0);

        e.scene.tweens.add({
            targets: e,
            scaleX: { from: 1, to: 1.2 },
            scaleY: { from: 1, to: 0.8 },
            alpha: { from: 1, to: 0.6 },
            rotation: { from: 0, to: 0.03 },
            yoyo: true,
            ease: 'sine.inout',
            duration: 600,
            onUpdate: () =>
            {
                const x = Rand(e.x - 10, e.x + 10);
                const y = Rand(e.y - 10, e.y + 10);

                e.scene.events.emit('fx_pathParticle', { x, y });
                e.scene.physics.overlap(e.scene.player.container, e, (p, e) =>
                {
                    e.scene.player.takeDamage(e.atk)
                });
            },
            onComplete: () =>
            {
                e.fsm.transition('wander');
            }
        })
    },
    'Anger': e =>
    {
        e.scene.tweens.add({
            targets: e,
            // yoyo: true,
            duration: 160,
            scaleX: { from: 1, to: -1 },
            // scaleY: { from: 1, to: 0.4 },
            alpha: { from: 1, to: 0.6 },
            loop: 8,
            onLoop: () =>
            {
                e.scene.events.emit('enemy_projectile', { x: e.x, y: e.y, angle: Math.random() * 5, id: 0, atk: e.atk })
            },
            onComplete: () =>
            {
                e.fsm.transition('wander');
            }
        })
    }
}


class IdleState 
{
    enter(e) { e.idle() }
    execute(t, d, e) { }
}


class CutsceneState 
{
    enter(e) { e.idle() }
    execute(t, d, e) { }
}


class WanderState 
{
    enter(e)
    {
        this.timer = Math.random() * 6000 >> 0;
        this.clockwise = Math.random() >= 0.5 ? true : false;
    }
    execute(t, d, e)
    {
        this.timer -= d;
        const steeringForce = SteeringBehaviors.orbit(e, e.scene.player.container, 8, this.clockwise)
        e.body.setVelocity(steeringForce.x * e.speed, steeringForce.y * e.speed);
        if (this.timer <= 0) e.fsm.transition('idle');
    }
}


class WalkState 
{
    x = 0; y = 0;
    enter(e, { x, y })
    {
        this.x = x;
        this.y = y;
        e.walk(x, y)
    }

    execute(t, d, e)
    {
        const distance = Phaser.Math.Distance.BetweenPoints(e, { x: this.x, y: this.y });
        if (distance <= e.range)
        {
            e.fsm.transition('idle');
            return;
        }
    }
}


class ActionState 
{
    enter(e, key) { e.action(key) }
    execute(t, d) { }
}


class DieState 
{
    enter(e) { e.die() }
    execute(t, d) { }
}


export class Boss extends Phaser.GameObjects.Sprite
{
    name = 'Spirit'
    hp = 100;
    maxhp = 100;
    speed = 20;
    atk = 1;
    range = 60;
    abilities = [];
    flipAnimsing = false;
    damageing = false;

    constructor(scene, x = 0, y = 0)
    {
        super(scene, x, y);

        this.scene.physics.world.enable(this);
        this.setPipeline('Light2D');
        // this.setBlendMode(Phaser.BlendModes.MULTIPLY)
        // this.barrel = this.preFX.addBarrel(1);

        this.body.setCollideWorldBounds(true);
        this.body.pushable = false;

        this.fsm = new StateMachine('idle', {
            'idle': new IdleState,
            'cutscene': new CutsceneState,
            'wander': new WanderState,
            'walk': new WalkState,
            'action': new ActionState,
            'die': new DieState
        }, [this]);

        const blackboard = new Blackboard();
        blackboard.setData('myself', this);
        blackboard.setData('target', this.scene.player.container);

        const AttackBehavior = new SequenceNode('attack', blackboard, [
            new SelectorNode('isFar', blackboard, new IsFar(blackboard), new MovetoTarget(blackboard)),
            new SelectorNode('checkMinionLow', blackboard, new CheckMinionLow(blackboard), new SpawnMinion(blackboard)),
            new SelectAbility(blackboard),
            new ExecuteAbility(blackboard),
        ]);

        this.behaviorTree = new SelectorNode('root', blackboard, new IsAction(blackboard), AttackBehavior);
    }

    init(x, y, key)
    {
        const { hp, speed, atk, range, abilities, sw, sh } = BossConfig[key];

        this.name = key;
        this.hp = hp;
        this.maxhp = hp;
        this.speed = speed;
        this.atk = atk;
        this.range = range;
        this.abilities = abilities;

        this.body.setEnable(true);
        this.body.setSize(sw, sh);
        // this.body.setOffset(this.body.width / 2, this.body.height / 2);

        this.setPosition(x, y);
        this.setDepth(y >> 0);
        this.setActive(true);
        this.setVisible(true);

        this.fsm.transition('idle');
    }

    idle()
    {
        this.body.setVelocity(0, 0);
        this.anims.play(BossConfig[this.name].idleAnims);
    }

    walk(x, y)
    {
        let from = -1;
        let to = 1;
        if (this.x < x) { from = 1; to = -1; }
        this.flipAnims(from, to);

        this.anims.play(BossConfig[this.name].walkAnims);
        this.scene.physics.moveTo(this, x, y, this.speed);
    }

    flipAnims(from, to)
    {
        if (this.flipAnimsing || this.scaleX === to) return;
        this.flipAnimsing = true;

        this.scene.tweens.add({
            targets: this,
            duration: 300,
            scaleY: { from: 0.8, to: 1 },
            scaleX: { from, to },
            onComplete: () =>
            {
                this.flipAnimsing = false;
            }
        })
    }

    action(key)
    {
        this.body.setVelocity(0, 0);
        this.anims.play(BossConfig[this.name].idleAnims);
        Abilities[key](this);
    }

    takeDamage(v)
    {
        const state = this.fsm.getState();
        if (state === 'die' || this.damageing) return;

        this.scene.cameras.main.shake(120, 0.01);
        this.damageing = true;
        this.hp -= v;
        this.scene.events.emit('update_boss_hp', this.hp, this.maxhp);

        const { x, y } = this;

        this.scene.sound.play('dash');
        this.scene.events.emit('fx_damage_value', { x, y, v });
        this.scene.events.emit('fx_damage_particle', { x, y });

        if (this.hp <= 0)
        {
            this.fsm.transition('die');
            return
        }

        this.setTintFill(0xffffff);
        this.scene.tweens.add({
            targets: this,
            duration: 120,
            yoyo: true,
            ease: 'sine.inout',
            scale: { from: 1, to: 1.1 },
            onComplete: () =>
            {
                this.damageing = false;
                this.clearTint();
            }
        })
    }

    die()
    {
        this.scene.events.emit('drop_item', { x: this.x, y: this.y });
        // TODO 延迟一段时间 或 拨片
        this.scene.events.emit('fx_explode', { x: this.x, y: this.y, count: 26, range: 56 });
        this.scene.events.emit('boss_die', this);
    }

    getAbility()
    {
        return this.abilities[Math.random() * this.abilities.length >> 0];
    }

    update(t, d)
    {
        this.behaviorTree.tick(t, d);
        this.fsm.step(t, d);
        this.depth = (this.y >> 0)
    }
}