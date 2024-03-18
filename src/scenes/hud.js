import { GAME_HEIGHT, GAME_WIDTH } from "../constant.js";
import { Card } from "../system/card.js";
import { Abilites } from "../entities/player/ability.js";
import { Message } from "../system/message.js";

export default class HUD extends Phaser.Scene
{
    graphicsPool = [
        { k: 'player_hp_bg', x: 0, y: 0, width: GAME_WIDTH, height: 2, color: 0xffffff },
        { k: 'player_hp_bar', x: 0, y: 0, width: GAME_WIDTH, height: 2, color: 0xff0000 },
        { k: 'player_exp_bg', x: 0, y: GAME_HEIGHT - 2, width: GAME_WIDTH, height: 2, color: 0xffffff },
        { k: 'player_exp_bar', x: 0, y: GAME_HEIGHT - 2, width: 0, height: 2, color: 0x74ff30 },
    ];

    constructor()
    {
        super({ key: 'hud' });
    }

    create()
    {
        const gameScene = this.scene.get('game');

        this.gameScene = gameScene;
        this.graphics = this.add.graphics();
        this.icons = this.add.group({ classType: Phaser.GameObjects.Image, maxSize: 8 });
        this.updateGraphics();

        this.card = new Card(this);
        this.message = new Message(this);

        gameScene.events.on('update_player_hp', this.updatePlayerHpBar, this);
        gameScene.events.on('update_player_exp', this.updatePlayerExpBar, this);
        gameScene.events.on('upgrade', this.upgrade, this);
    }

    updateAbilitiesIcon()
    {
        this.icons.children.entries.forEach(e => { this.icons.killAndHide(e) });

        const abilities = this.gameScene.player.equipSystem.abilities;
        const l = abilities.length;

        abilities.forEach((e, i) =>
        {
            const x = (GAME_WIDTH / 2) - (l / 2 * 10) + (i * 10);
            const texture = Abilites[e.key].texture;
            const icon = this.icons.get(x, GAME_HEIGHT - 6, texture);
            icon.setDisplaySize(6, 6).setActive(true).setVisible(true).setAlpha(0.8);
        })
    }

    upgrade()
    {
        this.scene.pause('game');
        this.card.open();
    }

    updatePlayerHpBar(v)
    {
        this.graphicsPool[1].width = GAME_WIDTH * v >> 0;
        this.updateGraphics();
    }

    updatePlayerExpBar(v)
    {
        this.graphicsPool[3].width = GAME_WIDTH * v >> 0;
        this.updateGraphics();
    }

    updateGraphics()
    {
        this.graphics.clear();
        this.graphicsPool.forEach(e =>
        {
            const { x, y, width, height, color } = e;
            this.graphics.fillStyle(color, 0.3);
            this.graphics.fillRect(x, y, width, height);
        })
    }
}