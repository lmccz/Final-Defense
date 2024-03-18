import Phaser from 'phaser';
import HUD from './scenes/hud.js';
import { Game } from './scenes/game.js';
import { GAME_HEIGHT, GAME_WIDTH } from './constant.js';
// import { OceanPipeline } from './pipelines/ocean.js';


const config = {
    type: Phaser.WEBGL,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'phaser',
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: { y: 400 },
            // debug: true
        },
    },
    dom: {
        createContainer: true,
    },
    render: {
        // prevent tile bleeding
        // antialiasGL: true,
        // prevent pixel art from becoming blurre when scaled
        pixelArt: true
    },
    backgroundColor: 0x000000,
    disableContextMenu: true,
    fps: { target: 60 },
    scale: {
        parent: 'phaser',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // pipeline: { 'OceanPipeline': OceanPipeline },
    scene: [Game, HUD]
};


window.onload = () => {
    new Phaser.Game(config);
};


