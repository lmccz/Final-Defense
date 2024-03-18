import { GAME_WIDTH } from "../constant.js";
import { Cutscene } from "./cutscene.js";


export class GameStart
{

    scene = undefined;

    constructor(scene)
    {
        this.scene = scene;
    }

    play()
    {
        const cutscenes = new Cutscene;
        const camera = this.scene.cameras.main;
        const player = this.scene.player.container;
        const boss = this.scene.enemyManager.spawnBoss('Spirit');

        boss.fsm.transition('cutscene');

        cutscenes.addScript(() =>
        {
            return new Promise(resolve =>
            {
                // 镜头先给boss
                camera.pan(boss.x, boss.y, 1000, 'Quad.easeInOut', true, (camera, progress) =>
                {
                    if (progress === 1)
                    {
                        resolve();
                    }
                });
            });
        });


        cutscenes.addScript(() =>
        {
            return new Promise(resolve =>
            {
                camera.zoomTo(2, 1000, 'Quad.easeInOut', false, (camera, progress) =>
                {
                    if (progress === 1)
                    {
                        resolve();
                    }
                });
            });
        });

        cutscenes.addScript(() =>
        {
            return new Promise(resolve =>
            {
                this.scene.events.emit('message', { x: GAME_WIDTH / 2, y: 16, content: 'BOSS SPIRIT', size: 21, color: 0xffffff, timeout: 3600 });

                camera.zoomTo(1, 2600, 'Quad.easeInOut', false, (camera, progress) =>
                {
                    if (progress === 1)
                    {
                        resolve();
                    }
                });
            });
        });

        cutscenes.addScript(() =>
        {
            return new Promise(resolve =>
            {
                camera.pan(player.x, player.y, 3000, 'Quad.easeInOut', true, (camera, progress) =>
                {
                    if (progress === 1)
                    {
                        resolve();
                    }
                });
            })
        });

        cutscenes.addScript(() =>
        {
            return new Promise(resolve =>
            {
                this.scene.conversation.start('start_game', undefined, () =>
                {
                    boss.fsm.transition('idle');
                    resolve();
                });

                this.scene.conversation.next();
            })
        });

        cutscenes.run();
    }
}