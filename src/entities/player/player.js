import StateMachine from "../../system/stateMachine.js";
import { MapAngleToDirection } from "../../system/utils.js";
import { ActionSystem } from "./action.js";
import { Attack, Dash, Idle, Walk } from "./states.js";


export class Player
{
    scene;

    container;
    #head;
    #hair;
    #eye;
    #hands;
    #body;
    #leg;

    fsm;
    #direction = 0;
    #side = 'right';

    speed = 56;
    flipAnimsing = false;
    damageing = false;
    range = 36;
    hp = 10;
    maxhp = 10;
    target = undefined;
    exp = 0;
    level = 1;

    eyeIndex = 1;
    legIndex = 1;
    bodyIndex = 1;
    hairIndex = 1;
    headIndex = 1;
    handsIndex = 1;
    legTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())
    headTint = 0xe6ac9c;
    bodyTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())
    hairTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())

    constructor(scene, config)
    {
        this.scene = scene;
        this.light = scene.lights.addLight(0, 0, 168, 0x333333, 2);

        this.container = scene.add.container(90, 56);
        this.eyeIndex = config.eyeIndex;
        this.legIndex = config.legIndex;
        this.bodyIndex = config.bodyIndex;
        this.hairIndex = config.hairIndex;
        this.headIndex = config.headIndex;
        this.handsIndex = config.handsIndex;
        this.legTint = config.legTint;
        this.headTint = config.headTint;
        this.bodyIndex = config.bodyIndex;
        this.hairTint = config.hairTint;

        scene.physics.world.enable(this.container);
        scene.add.existing(this.container);

        this.cloak = scene.add.sprite(7, 0, 'cloak');
        this.cloak.setPipeline('Light2D');
        this.cloak.anims.play('cloak_anims')
        this.cloak.setOrigin(0.5, 0);

        this.shadow = scene.add.sprite(0, 8, 'shadow');
        this.#head = scene.add.sprite(0, 0, `head${this.headIndex}`);
        this.#hair = scene.add.sprite(0, 0, `hair${this.hairIndex}`);
        this.#eye = scene.add.sprite(0, 0, `eye${this.eyeIndex}`);
        this.#hands = scene.add.sprite(0, 0, `hands${this.handsIndex}`);
        this.#body = scene.add.sprite(0, 0, `body${this.bodyIndex}`);
        this.#leg = scene.add.sprite(0, 0, `leg${this.legIndex}`);

        this.#head.setPipeline('Light2D');
        this.#hair.setPipeline('Light2D');
        this.#eye.setPipeline('Light2D');
        this.#hands.setPipeline('Light2D');
        this.#body.setPipeline('Light2D');
        this.#leg.setPipeline('Light2D');

        this.#leg.setTint(this.legTint);
        this.#body.setTint(this.bodyTint);
        this.#head.setTint(this.headTint);
        this.#hands.setTint(this.headTint);
        this.#hair.setTint(this.hairTint);

        this.container.add([this.shadow, this.cloak, this.#head, this.#hair, this.#eye, this.#body, this.#leg, this.#hands]);
        this.container.body.setCollideWorldBounds(true);
        this.container.body.pushable = false;
        this.container.body.setSize(8, 8);

        this.scene.rexOutlinePipeline.add(this.container, { thickness: 1, outlineColor: 0xffffff });

        // this.scene.tweens.add({
        //     targets: rexOutlinePipeline,
        //     duration: 860,
        //     yoyo: true,
        //     repeat: -1,
        //     thickness: { from: 0, to: 2 },
        //     ease: 'sine.inout',
        // });

        const { W, A, S, D } = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input.keyboard.addKeys({ w: W, a: A, s: S, d: D });

        this.fsm = new StateMachine('idle', {
            'idle': new Idle,
            'walk': new Walk,
            'dash': new Dash,
        }, [this]);

        this.equipSystem = new ActionSystem(this,config.weaponKey);

        this.scene.events.on('player_dash', this.dash, this);
        this.scene.events.on('player_attack', this.attack, this);
        this.scene.events.on('heal', this.heal, this);
        this.scene.events.on('exp', this.addExp, this);
    }

    dash(target)
    {
        this.fsm.transition('dash', target);
    }

    attack({ x, y })
    {
        const radian = Phaser.Math.Angle.BetweenPoints(this.container, { x, y });
        const angle = Phaser.Math.RadToDeg(radian)
        const direction = MapAngleToDirection(angle)

        if (this.direction != direction) this.direction = direction;
        this.equipSystem.attack(angle, radian);
    }

    setTarget({ target, dash = false })
    {
        const radian = Phaser.Math.Angle.BetweenPoints(this.container, target);
        const angle = Phaser.Math.RadToDeg(radian);
        const direction = MapAngleToDirection(angle);

        this.direction = direction;
        if (dash) this.fsm.transition('dash', target);
        else this.fsm.transition('walk', target);
    }

    get direction()
    {
        return this.#direction;
    }

    set direction(value)
    {
        if (value === this.direction) return;

        if (value === 0 && this.#side != 'left')
        {
            this.container.bringToTop(this.cloak);
            this.cloak.setAngle(90);
            this.cloak.y += 5;
            this.#side = 'left';
            // return
        }

        if (value === 1)
        {
            this.flipAnims(1, -1);
        }

        if (value === 2 && this.#side != 'right')
        {
            this.container.sendToBack(this.cloak);
            this.cloak.setAngle(0);
            this.cloak.y -= 5;
            this.#side = 'right';
            // return
        }

        if (value === 3)
        {
            this.flipAnims(-1, 1);
        }

        this.#direction = value;
        this.walk();
    }

    takeDamage(v)
    {
        if (this.damageing || this.hp <= 0) return;

        this.scene.sound.play('dash');
        this.damageing = true;
        this.hp -= v;
        this.scene.events.emit('update_player_hp', this.hp / this.maxhp);
        this.#leg.setTintFill(0xffffff);
        this.#body.setTintFill(0xffffff);
        this.#head.setTintFill(0xffffff);
        this.#hands.setTintFill(0xffffff);
        this.#hair.setTintFill(0xffffff);

        this.scene.tweens.add({
            targets: this.container,
            duration: 120,
            yoyo: true,
            ease: 'sine.inout',
            scaleY: { from: 1, to: 1.2 },
            rotation: { from: 0, to: 0.3 },
            onComplete: () =>
            {
                this.damageing = false;
                this.#leg.setTint(this.legTint);
                this.#body.setTint(this.bodyTint);
                this.#head.setTint(this.headTint);
                this.#hands.setTint(this.headTint);
                this.#hair.setTint(this.hairTint);
            }
        })
    }

    heal(v)
    {
        this.hp += v;
        if (this.hp > this.maxhp) this.hp = this.maxhp;
        this.scene.events.emit('update_player_hp', this.hp / this.maxhp);
    }

    addExp(v = 1)
    {
        this.exp += v / this.level / 10;

        if (this.exp >= 1)
        {
            this.level += 1;
            this.exp = 0;
            this.scene.events.emit('upgrade');
        }

        this.scene.events.emit('update_player_exp', this.exp);
    }

    idle()
    {
        this.container.body.setVelocity(0, 0);
        this.#head.anims.stop();
        this.#hair.anims.stop();
        this.#eye.anims.stop();
        this.#hands.anims.stop();
        this.#body.anims.stop();
        this.#leg.anims.stop();
    }

    flipAnims(from, to)
    {
        if (this.flipAnimsing || this.container.scaleX === to) return;
        this.flipAnimsing = true;

        this.scene.tweens.add({
            targets: this.container,
            duration: 300,
            scaleY: { from: 0.6, to: 1 },
            scaleX: { from, to },
            onComplete: () =>
            {
                this.flipAnimsing = false;
            }
        })
    }

    walk()
    {
        this.#head.anims.play(`head${this.headIndex}_${this.#side}_anims`);
        this.#hair.anims.play(`hair${this.hairIndex}_${this.#side}_anims`);
        this.#eye.anims.play(`eye${this.eyeIndex}_${this.#side}_anims`);
        this.#hands.anims.play(`hands${this.handsIndex}_${this.#side}_anims`);
        this.#body.anims.play(`body${this.bodyIndex}_${this.#side}_anims`);
        this.#leg.anims.play(`leg${this.legIndex}_${this.#side}_anims`);
    }

    update(t, d)
    {
        this.fsm.step(t, d);
        this.equipSystem.update(t, d);
        this.light.setPosition(this.container.x, this.container.y + 10);
        this.container.setDepth(this.container.y >> 0);
    }
}