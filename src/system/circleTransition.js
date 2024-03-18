export class CircleTransition
{
    scene = undefined;
    r = 0;

    constructor(scene)
    {
        this.scene = scene.scene.get('hud');

        const shape = this.scene.add.graphics();
        shape.setScrollFactor(0);
        shape.beginPath();
        shape.fillStyle(0x000000);
        shape.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
        shape.closePath();
        shape.depth = 99;

        const shapeMask = this.scene.make.graphics();
        shapeMask.setScrollFactor(0);
        shapeMask.fillStyle(0xffffff);
        this.shapeMask = shapeMask;

        const mask = shapeMask.createGeometryMask();
        mask.invertAlpha = true;

        shape.setMask(mask);
    }

    close(callback)
    {
        const { width, height } = this.scene.cameras.main;
        const r = Math.sqrt(2) * width / 2;

        this.r = r;
        this.scene.tweens.add({
            targets: this,
            duration: 1000,
            r: { from: r, to: 0 },
            onUpdate: () =>
            {
                this.shapeMask.clear();
                this.shapeMask.fillCircle(width / 2, height / 2, this.r);
            },
            onComplete: () =>
            {
                if (callback) callback();
            }
        });
    }

    open(callback)
    {
        const { width, height } = this.scene.cameras.main;
        const r = 3 + Math.sqrt(2) * width / 2;

        this.r = 0;
        this.scene.tweens.add({
            targets: this,
            duration: 1200,
            delay: 600,
            r: { from: 0, to: r },
            onUpdate: () =>
            {
                this.shapeMask.clear();
                this.shapeMask.fillCircle(width / 2, height / 2, this.r);
            },
            onComplete: () =>
            {
                if (callback) callback();
            }
        });
    }
}