export class Grass extends Phaser.GameObjects.Image {

    tweening = false;

    constructor(scene, x, y) {
        super(scene, x, y, 'grass');

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.setAlpha(0.6);
        this.setPipeline('Light2D');
        this.setOrigin(0.5, 1);
        this.setDepth(y >> 0);
        // this.body.setSize(8, 8);
        // console.log(this)

        this.windFX = scene.tweens.add({
            targets: this,
            duration: 1200 + Math.random() * 1000 >> 0,
            rotation: { from: -0.08, to: 0.08 },
            scale: { from: 1, to: 1.1 },
            yoyo: true,
            repeat: -1
        });
    }

    handOverlap(t) {
        if (t.body.velocity.x === 0 && t.body.velocity.y === 0) return;
        if (this.tweening) return;
        this.tweening = true;
        this.scene.tweens.add({
            targets: this,
            duration: 300,
            rotation: { from: -0.16, to: 0.16 },
            onComplete: () => {
                this.tweening = false;
                this.rotation = 0;
            },
            yoyo: true
        });
    }
}