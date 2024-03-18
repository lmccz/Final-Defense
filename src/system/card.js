const Abilities = [
    {
        t: 'range',
        use: game =>
        {
            const i = game.player.equipSystem.abilities.findIndex(e => e.key === 'range_spread');
            if (i != -1) game.player.equipSystem.abilities[i].cd -= 1000;
            else game.player.equipSystem.abilities.push({ timer: 0, cd: 6000, key: 'range_spread', level: 1 });
        },
    },
    {
        t: 'arbit',
        use: game =>
        {
            const i = game.player.equipSystem.abilities.findIndex(e => e.key === 'arbitrary');
            if (i != -1) game.player.equipSystem.abilities[i].cd -= 100;
            else game.player.equipSystem.abilities.push({ timer: 0, cd: 1000, key: 'arbitrary', level: 1 });
        },
    },
    {
        t: 'proje',
        use: game =>
        {
            const i = game.player.equipSystem.abilities.findIndex(e => e.key === 'projectile');
            if (i != -1) game.player.equipSystem.abilities[i].cd -= 100;
            else game.player.equipSystem.abilities.push({ timer: 0, cd: 400, key: 'projectile', level: 1 });
        },
    },
    {
        t: 'lightning',
        use: game =>
        {
            const i = game.player.equipSystem.abilities.findIndex(e => e.key === 'lightning');
            if (i != -1) game.player.equipSystem.abilities[i].cd -= 100;
            else game.player.equipSystem.abilities.push({ timer: 0, cd: 2000, key: 'lightning', level: 1 });
        },
    },
    {
        t: 'splash',
        use: game =>
        {
            const i = game.player.equipSystem.abilities.findIndex(e => e.key === 'splash');
            if (i != -1) game.player.equipSystem.abilities[i].cd -= 100;
            else game.player.equipSystem.abilities.push({ timer: 0, cd: 2000, key: 'splash', level: 1 });
        },
    },
]


export class Card 
{
    possible = [0, 0, 0];

    constructor(scene)
    {
        this.scene = scene;

        this.card1 = scene.add.image(22, 18, 'card')
            .setInteractive()
            .setOrigin(0, 0)
            .setDepth(9)
            .setActive(false)
            .setVisible(false)
            .on('pointerdown', () => { this.click(0) });

        this.card2 = scene.add.image(58, 18, 'card')
            .setInteractive()
            .setOrigin(0, 0)
            .setDepth(9)
            .setActive(false)
            .setVisible(false)
            .on('pointerdown', () => { this.click(1) });

        this.card3 = scene.add.image(92, 18, 'card')
            .setInteractive()
            .setOrigin(0, 0)
            .setDepth(9)
            .setActive(false)
            .setVisible(false)
            .on('pointerdown', () => { this.click(2) });

        this.t1 = scene.add.bitmapText(22, 28, 'fonts', '', 10)
            .setDepth(10)
            .setActive(false)
            .setVisible(false);

        this.t2 = scene.add.bitmapText(56, 28, 'fonts', '', 10)
            .setDepth(10)
            .setActive(false)
            .setVisible(false);

        this.t3 = scene.add.bitmapText(92, 28, 'fonts', '', 10)
            .setDepth(10)
            .setActive(false)
            .setVisible(false);
    }

    click(index)
    {
        const select = this.possible[index];

        this.card1.setActive(false);
        this.card2.setActive(false);
        this.card3.setActive(false);
        this.card1.setVisible(false);
        this.card2.setVisible(false);
        this.card3.setVisible(false);

        this.t1.setActive(false);
        this.t2.setActive(false);
        this.t3.setActive(false);
        this.t1.setVisible(false);
        this.t2.setVisible(false);
        this.t3.setVisible(false);

        this.scene.scene.resume('game');
        Abilities[select].use(this.scene.scene.get('game'));
        this.scene.updateAbilitiesIcon();
    }

    open()
    {
        this.card1.setActive(true);
        this.card2.setActive(true);
        this.card3.setActive(true);
        this.card1.setVisible(true);
        this.card2.setVisible(true);
        this.card3.setVisible(true);

        this.scene.tweens.add({
            targets: [this.card1, this.card2, this.card3],
            duration: 640,
            y: { start: -60, to: 18 },
            ease: 'sine.inout',
            alpha: { from: 0, to: 1 },
            onComplete: () =>
            {
                this.possible[0] = Math.random() * Abilities.length >> 0;
                this.possible[1] = Math.random() * Abilities.length >> 0;
                this.possible[2] = Math.random() * Abilities.length >> 0;

                this.t1.setText(Abilities[this.possible[0]].t).setActive(true).setVisible(true);
                this.t2.setText(Abilities[this.possible[1]].t).setActive(true).setVisible(true);
                this.t3.setText(Abilities[this.possible[2]].t).setActive(true).setVisible(true);
            }
        })
    }
}