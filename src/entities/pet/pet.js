import StateMachine from "../../system/stateMachine.js";
import { Idle } from "./idle.js";
import { Move } from "./move.js";


const Pets = {
    'cat': {
        texture: 'cat_1',
        frame: 0,
    }
}


export class Pet extends Phaser.GameObjects.Sprite
{
    speed = 16 + Math.random() * 20 >> 0;
    flipAnimsing = false;
    range = 26;
    name = 'cat';

    constructor(scene, x, y)
    {
        super(scene, x, y, 'cat_1', 0);

        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.body.setCollideWorldBounds(true);
        this.setPipeline('Light2D');
        this.body.setSize(6, 6);

        this.shadow = scene.add.sprite(x, y, '');
        this.shadow.setAlpha(0.3);
        this.shadow.setTint(0x000000);
        this.shadow.setFlipY(true)
        // this.shadow.setActive(false);
        // this.shadow.setVisible(false);
        this.scene.rexOutlinePipeline.add(this, { thickness: 1, outlineColor: 0xffffff });
        
        this.fsm = new StateMachine('idle', {
            'idle': new Idle,
            'move': new Move,
        }, [this]);
    }

    init(config)
    {

    }

    idle()
    {
        this.body.setVelocity(0, 0);
        this.anims.play(`${this.name}IdleAnims`);
        this.shadow.anims.play(`${this.name}IdleAnims`);
    }

    flipAnims(from, to)
    {
        if (this.flipAnimsing || this.scaleX === to) return;
        this.flipAnimsing = true;

        this.scene.tweens.add({
            targets: [this, this.shadow],
            duration: 300,
            scaleY: { from: 0.6, to: 1 },
            scaleX: { from, to },
            onComplete: () =>
            {
                this.flipAnimsing = false;
            }
        })
    }

    walk(x, y)
    {
        const scaleX = x > this.x ? 1 : -1;

        if (this.scaleX != scaleX)
        {
            this.flipAnims(this.scaleX, scaleX);
        }

        this.scene.physics.moveToObject(this, { x, y }, this.speed);
        this.anims.play(`${this.name}WalkAnims`);
    }

    update(t, d)
    {
        this.fsm.step(t, d);
        this.shadow.setPosition(this.x, this.y + 12);
        this.setDepth(this.y >> 0);
    }
}