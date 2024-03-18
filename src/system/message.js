export class Message
{
    constructor(scene)
    {
        this.scene = scene;
        this.objectPool = scene.add.group({ classType: Phaser.GameObjects.BitmapText, maxSize: 2 });
        this.scene.scene.get('game').events.on('message', this.post, this);
    }

    post({ x, y, content, size, color = 0xffffff, timeout = 1000 })
    {
        const message = this.objectPool.get(x, y, 'fonts');
        if (!message) return false;

        message.setCenterAlign();
        message.setOrigin(0.5, 0.5);
        message.setDepth(999);
        message.setText(content);
        message.setFontSize(size);
        message.setAlpha(1);
        message.setRotation(0);
        message.setActive(true).setVisible(true);
        message.setTint(color);

        this.scene.tweens.add({
            targets: message,
            alpha: { from: 1, to: 0 },
            duration: timeout,
            onComplete: () =>
            {
                this.objectPool.killAndHide(message);
            },
        });
    }
}