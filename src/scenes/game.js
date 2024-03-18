import { CreateAnims } from "../anims/createAnims.js";
import { GAME_HEIGHT, GAME_WIDTH, PARALLAX_HEIGHT, SKINS, STAGE_HEIGHT, STAGE_WIDTH } from "../constant.js";
import { GameStart } from "../cutscenes/gameStart.js";
import { DropManager } from "../entities/dropItem/dropManager.js";
import { EnemyManager } from "../entities/enemys/manager.js";
import { Grass } from "../entities/grass.js";
import { Pet } from "../entities/pet/pet.js";
import { Weapon } from "../entities/player/ability.js";
import { PlayerProjectile } from "../entities/player/manager.js";
import { Player } from "../entities/player/player.js";
import { CreateParticles } from "../particles/createParticles.js";
import { CircleTransition } from "../system/circleTransition.js";
import { Conversation } from "../system/conversation.js";
import { FXManager } from "../system/fxManager.js";
import { InputHandler } from "../system/inputHandler.js";
import { Rand } from "../system/utils.js";


export class Game extends Phaser.Scene
{
    parallax = [];

    constructor()
    {
        super({ key: 'game' });
    }

    preload()
    {
        this.graphics = this.add.graphics();
        this.load.on('progress', this.drawProgressBar, this);
        this.load.once('complete', this.loadComplete, this);
        loadResources(this.load);
    }

    create()
    {
        this.input.setDefaultCursor('url(assets/items/attack-cursor.png), pointer');
        // this.input.dragTimeThreshold = 500; // 延迟拖动时间给点击;

        CreateAnims(this.anims);
        CreateParticles();

        this.scene.launch('hud');
        this.circleTransition = new CircleTransition(this);
        this.circleTransition.open();
        this.startMenu();

        this.sound.play('bgm', { loop: true });
    }

    startGame(playerConfig)
    {
        this.lights.enable();
        this.lights.setAmbientColor(0xaaaaaa);

        this.physics.world.setBounds(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
        this.cameras.main.setBounds(0, -PARALLAX_HEIGHT, STAGE_WIDTH, STAGE_HEIGHT + PARALLAX_HEIGHT);
        // this.cameras.main.postFX.addTiltShift(0.51, 0.36, 0.5);
        // this.cameras.main.postFX.addVignette(0.5, 0.5, 1.4);

        const parallaxs = ['glacial_mountains', 'clouds_bg'];
        parallaxs.forEach(e =>
        {
            const parallax = this.add.tileSprite(0, -210, STAGE_WIDTH, 216, e);
            // parallax.setScrollFactor(0);
            parallax.setOrigin(0, 0);
            parallax.setPipeline('Light2D');
            this.parallax.push(parallax);
        });

        const stage = this.add.image(0, 0, 'stage');
        stage.setOrigin(0, 0);
        stage.setPipeline('Light2D');

        // const cloud = this.add.image(-50, Math.random() * STAGE_HEIGHT >> 0, 'clouds');
        // cloud.setPipeline('Light2D');
        // cloud.setDepth(999);
        // cloud.setAlpha(0.1);
        // cloud.setTint(0x000000);

        const treesPosition = [{ x: 126, y: 16 }, { x: 230, y: 26 }, { x: 266, y: 43 }, { x: 206, y: 55 }];
        const trees = [];
        treesPosition.forEach(e =>
        {
            const tree = this.add.image(e.x, e.y, 'tree-002');
            tree.setDepth(18 + tree.y >> 0);
            tree.setPipeline('Light2D');
            tree.setAlpha(0.6);
            trees.push(tree)
        });

        let grassCount = 40;
        const grassGroup = [];
        while (grassCount > 0)
        {
            const x = Rand(86, 220);
            const y = Rand(10, 68);
            grassGroup.push(new Grass(this, x, y));
            grassCount -= 1
        }

        this.friendly = [];

        this.rexOutlinePipeline = this.plugins.get('rexoutlinepipelineplugin');
        this.player = new Player(this, playerConfig);
        this.fxManager = new FXManager(this);
        this.cat = new Pet(this, 46, 46);
        this.dropManager = new DropManager(this);
        this.enemyManager = new EnemyManager(this);
        this.playerProjectile = new PlayerProjectile(this);
        this.inputHandler = new InputHandler(this);
        this.conversation = new Conversation(this);

        this.friendly.push(this.player.container);

        this.physics.add.overlap(this.playerProjectile.projectiles, this.enemyManager.objectPool, (t, e) => { t.handOverlap(e); });
        this.physics.add.overlap(this.playerProjectile.projectiles, this.enemyManager.bossPool, (t, e) => { t.handOverlap(e); });
        this.physics.add.overlap(this.enemyManager.projectiles, this.player.container, (t, e) => { t.handOverlap(this.player); });
        this.physics.add.overlap(this.player.container, grassGroup, (t, e) => { e.handOverlap(this.player.container); });
        this.physics.add.overlap(this.enemyManager.objectPool, grassGroup, (t, e) => { e.handOverlap(t); });
        this.physics.add.overlap(this.player.container, this.dropManager.objectPool, (p, e) => { e.handOverlap(); });
        this.physics.add.collider(this.enemyManager.objectPool, this.enemyManager.objectPool);

        // this.cameras.main.startFollow(this.player.container, false, 0.06, 0.06);
        this.cameras.main.pan(400, 56, 10, 'Quad.easeInOut', false);
        this.sound.play('rain', { loop: true });

        this.circleTransition.open(async () =>
        {
            const gamestart = new GameStart(this);
            gamestart.play();
        });

        let parallaxIndex = 0;

        this.events.on('update', (t, d) =>
        {
            this.player.update(t, d);
            this.cat.update(t, d);
            // this.fxManager.update(t, d);

            // const x = this.cameras.main.scrollX;
            parallaxIndex += (d / 86);

            this.parallax.forEach((e, i) =>
            {
                e.setTilePosition(parallaxIndex * (i + 1), 0);
            })

            // cloud.x += .3;
            // if (cloud.x >= STAGE_WIDTH + 50)
            // {
            //     cloud.x = -50;
            //     cloud.y = Math.random() * STAGE_HEIGHT >> 0;
            // }
        });
    }

    startMenu()
    {
        let i = 0.1;
        let eyeIndex = 1;
        let legIndex = 1;
        let bodyIndex = 1;
        let hairIndex = 1;
        let headIndex = 1;
        let handsIndex = 1;
        let legTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())
        let headTint = 0xe6ac9c;
        let bodyTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())
        let hairTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())

        const background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'b');
        background.setOrigin(0, 0);
        background.alpha = 0.3;

        const title = this.add.bitmapText(GAME_WIDTH / 2, 6, 'fonts', 'Final Defense', 18);
        title.setOrigin(0.5, 0);
        title.setTintFill(0xe6ac9c)
        // title.alpha = 0.8;

        const start = this.add.bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 4, 'fonts', 'start', 12);
        start.setOrigin(0.5, 1);
        start.setInteractive();

        const tips = this.add.bitmapText(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'fonts', `Survive the monster's \n attack and use all \n the props in your hand`, 9);
        tips.setOrigin(0.5, 0.5);
        tips.setCenterAlign();
        tips.setTintFill(0x333333)
        tips.alpha = 0.3;

        const head = this.add.sprite(0, 0, `head${headIndex}`);
        const hair = this.add.sprite(0, 0, `hair${hairIndex}`);
        const eye = this.add.sprite(0, 0, `eye${eyeIndex}`);
        const hands = this.add.sprite(0, 0, `hands${handsIndex}`);
        const body = this.add.sprite(0, 0, `body${bodyIndex}`);
        const leg = this.add.sprite(0, 0, `leg${legIndex}`);

        const container = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [head, hair, eye, hands, body, leg]);
        container.setInteractive(new Phaser.Geom.Circle(0, 0, 12), Phaser.Geom.Circle.Contains);
        container.setDepth(3);
        container.on('pointerdown', () =>
        {
            eyeIndex = 1 + Math.random() * 2 >> 0;
            bodyIndex = 1 + Math.random() * 3 >> 0;
            hairIndex = 1 + Math.random() * 22 >> 0;
            headIndex = 1 + Math.random() * 2 >> 0;
            legTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())
            headTint = 0xe6ac9c;
            bodyTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())
            hairTint = (0xFF0000 * Math.random()) + (0x00FF00 * Math.random()) + (0x0000FF * Math.random())
            head.setTexture(`head${headIndex}`);
            hair.setTexture(`hair${hairIndex}`);
            eye.setTexture(`eye${eyeIndex}`);
            hands.setTexture(`hands${handsIndex}`);
            body.setTexture(`body${bodyIndex}`);
            leg.setTexture(`leg${legIndex}`);
            leg.setTint(legTint);
            body.setTint(bodyTint);
            head.setTint(headTint);
            hands.setTint(headTint);
            hair.setTint(hairTint);
            head.anims.play(`head${headIndex}_right_anims`);
            hair.anims.play(`hair${hairIndex}_right_anims`);
            eye.anims.play(`eye${eyeIndex}_right_anims`);
            hands.anims.play(`hands${handsIndex}_right_anims`);
            body.anims.play(`body${bodyIndex}_right_anims`);
            leg.anims.play(`leg${legIndex}_right_anims`);
        });

        const graphics = this.add.graphics();
        // graphics.lineStyle(1, headTint, 0.3);
        graphics.fillStyle(headTint, 0.3);
        graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
        graphics.fillCircle(container.x, container.y, container.input.hitArea.radius);

        // weapon
        let weaponIndex = 0;
        const weapons = ['sword', 'bow', 'spear'];
        const weapon = this.add.image(container.x + 16, container.y + 6, Weapon[weapons[weaponIndex]].texture);
        weapon.setInteractive();
        weapon.on('pointerdown', () =>
        {
            weaponIndex++
            if (weaponIndex >= weapons.length) weaponIndex = 0;
            weapon.setTexture(Weapon[weapons[weaponIndex]].texture);
        })

        graphics.fillCircle(container.x + 16, container.y + 6, 8);

        container.emit('pointerdown');

        const weaponTween = this.tweens.add({
            targets: weapon,
            duration: 6800,
            angle: { from: 0, to: 360 },
            repeat: -1,
        })

        const startTween = this.tweens.add({
            targets: start,
            yoyo: true,
            duration: 1000,
            tint: { from: 0xff0000, to: 0xffffff },
            ease: 'sine.inout',
            alpha: { from: 0.1, to: 0.6 },
            repeat: -1,
        })

        const titleTween = this.tweens.add({
            targets: title,
            yoyo: true,
            duration: 4000,
            //tint: { from: 0xff0000, to: 0xfff000 },
            ease: 'sine.inout',
            rotation: { from: -0.1, to: 0.1 },
            repeat: -1,
        })

        let updateBackground = () =>
        {
            i += 0.1;
            background.setTilePosition(-i, i);
        }

        this.events.on('update', updateBackground)

        start.on('pointerdown', () =>
        {
            start.disableInteractive();
            this.circleTransition.close(() =>
            {
                this.events.off('update', updateBackground);
                updateBackground = null;

                titleTween.destroy();
                startTween.destroy();
                background.destroy();
                title.destroy();
                start.destroy();
                tips.destroy();
                container.destroy();
                graphics.destroy();
                weaponTween.destroy();
                weapon.destroy();
                
                this.startGame({
                    eyeIndex, legIndex, bodyIndex, hairIndex, headIndex, handsIndex,
                    legTint, headTint, bodyIndex, hairTint,
                    weaponKey: weapons[weaponIndex]
                });
            })
        });
    }

    enemyGetRangeTarget(x, y, range)
    {
        return this.friendly.find(e => (Phaser.Math.Distance.BetweenPoints(e, { x, y }) <= range));
    }

    drawProgressBar(value)
    {
        this.graphics.clear();
        this.graphics.fillStyle(0x00000, 1);
        this.graphics.fillRect((GAME_WIDTH / 4), (GAME_HEIGHT / 2) - 17, (GAME_WIDTH / 2) * value, 1);
    }

    loadComplete()
    {
        this.load.off('progress', this.drawProgressBar, this);
        this.graphics.destroy();
        delete this.graphics;
    }
}


const loadResources = load =>
{
    load.image('clouds_bg', 'assets/items/parallax/clouds_mg_1.png');
    load.image('glacial_mountains', 'assets/items/parallax/clouds_mg_2.png');

    load.image('stage', 'assets/items/map.png');
    load.image('b', 'assets/items/b.png');
    load.image('tree-002', 'assets/items/tree-002.png');
    load.image('sword2', 'assets/items/sword2.png');
    load.image('particles_rain', 'assets/particles/rain.png');
    load.image('square', 'assets/particles/blob1.png');
    load.image('star', 'assets/particles/star.png');
    load.image('white', 'assets/particles/white.png');
    // load.image('line', 'assets/particles/line.png');
    load.image('phantom', 'assets/particles/phantom.png');
    load.image('fireball', 'assets/items/fireball.png');
    load.image('grass', 'assets/items/grass.png');
    load.image('smoke-puff', 'assets/particles/smoke-puff.png');
    load.image('card', 'assets/items/card.png');
    load.image('slice', 'assets/items/slice.png');
    load.image('bowIcon', 'assets/items/bowIcon.png');
    load.image('arrow', 'assets/items/arrow.png');
    load.image('shadow', 'assets/items/shadowMed.png');
    load.image('bulletb', 'assets/items/bulletb.png');
    load.image('slash_3', 'assets/items/slash_2.png');
    load.image('spear', 'assets/items/sSpear2.png');
    load.image('equipment', 'assets/ui/equipment.png');
    load.image('Health_01', 'assets/ui/Health_01.png');

    load.spritesheet('splash', 'assets/items/Thunder splash w blur.png', { frameWidth: 48, frameHeight: 48 });
    load.spritesheet('bullet', 'assets/items/bullet.png', { frameWidth: 8, frameHeight: 8 });
    load.spritesheet('bat', 'assets/items/bat.png', { frameWidth: 16, frameHeight: 16 });
    load.spritesheet('GiantSpirit', 'assets/boss/GiantSpirit/Idle.png', { frameWidth: 50, frameHeight: 50 });
    load.spritesheet('cloak', 'assets/items/cloak.png', { frameWidth: 7, frameHeight: 8 });
    load.spritesheet('cat_1', 'assets/items/cat_1.png', { frameWidth: 17, frameHeight: 17 });
    load.spritesheet('coin', 'assets/items/coin.png', { frameWidth: 8, frameHeight: 8 });
    load.spritesheet('heart', 'assets/items/heart.png', { frameWidth: 13, frameHeight: 13 });
    load.spritesheet('flamethrower_bullet', 'assets/items/flamethrower_bullet.png', { frameWidth: 13, frameHeight: 10 });
    load.spritesheet('eye', 'assets/items/eye.png', { frameWidth: 16, frameHeight: 16 });
    load.spritesheet('RainOnFloor', 'assets/particles/RainOnFloor.png', { frameWidth: 8, frameHeight: 8 });

    for (let i = 0; i < SKINS.length; i++)
    {
        load.spritesheet(SKINS[i], `assets/character/${SKINS[i]}.png`, { frameWidth: 20, frameHeight: 20 });
    }

    load.audio('rain', 'assets/sounds/rain.mp3');
    load.audio('bgm', 'assets/sounds/bgm.mp3');
    load.audio('fire', 'assets/sounds/fire.mp3');
    load.audio('bow_shoot', 'assets/sounds/bow_shoot.wav');
    load.audio('dash', 'assets/sounds/dash.wav');
    load.audio('rumble', 'assets/sounds/rumble.wav');
    // load.tilemapTiledJSON('lands', 'assets/maps/lands.json');

    load.atlas('arbitrary', 'assets/items/0/arbitrary.png', 'assets/items/0/arbitrary.json');
    load.atlas('flame-spread-explosion', 'assets/items/flame-spread-explosion.png', 'assets/items/flame-spread-explosion.json');

    load.bitmapFont('fonts', 'assets/fonts/nokia.png', 'assets/fonts/nokia.xml');
    load.plugin('rexoutlinepipelineplugin', 'src/pipelines/rexoutlinepipelineplugin.min.js', true);
};