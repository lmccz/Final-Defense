import { DropItems } from "./dropManager.js";


export class DropItem extends Phaser.GameObjects.Sprite
{
    droping = false;
    timer = 6000;

    constructor(scene, x, y)
    {
        super(scene, x, y, 'coin');
        this.scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);
        this.setPipeline('Light2D');
        // this.scene.rexOutlinePipeline.add(this, { thickness: 1, outlineColor: 0xffffff });
    }

    handOverlap()
    {
        if (this.droping) return;
        const itemfunc = DropItems.find(e => e.key === this.name);
        itemfunc.pickup(this);
        this.scene.events.emit('kill_drop_item', this);
    }

    init({ x, y, texture, anims, key })
    {
        this.name = key;
        this.droping = false;
        this.body.setEnable(true);
        this.setPosition(x, y);
        this.setDepth(y >> 0);
        this.setTexture(texture);
        this.setVisible(true);
        this.setActive(true);
        if (anims) this.anims.play(anims);
        this.drop(80);
    }

    drop(launchVelocity = 60)
    {
        const randLaunchAngle = Math.random() * -60 + -60;
        this.droping = true;
        this.body.setGravityY(300);
        this.scene.physics.velocityFromAngle(randLaunchAngle, launchVelocity, this.body.velocity);
        this.scene.time.delayedCall(300, () =>
        {
            this.body.setGravity(0);
            this.body.setVelocity(0);
            this.scene.physics.velocityFromAngle(-100, 30, this.body.velocity);
            this.body.setGravityY(300);
            this.scene.time.delayedCall(150, () =>
            {
                this.droping = false;
                this.body.setGravity(0);
                this.body.setVelocity(0);
            })
        })
    }
}