import { GAME_HEIGHT, GAME_WIDTH } from "../../constant.js";
import { Projectile } from "../projectile/projectile.js";
import { BasicEnemy } from "./basicEnemy.js";
import { Boss } from "./boss.js";


export class EnemyManager
{
    bossPool;
    objectPool;
    projectiles;
    scene;
    active = 0;

    constructor(scene)
    {
        this.scene = scene;

        this.bossPool = scene.add.group({ classType: Boss, runChildUpdate: true, maxSize: 3 });
        this.objectPool = scene.add.group({ classType: BasicEnemy, runChildUpdate: true, maxSize: 36 });
        this.projectiles = scene.add.group({ classType: Projectile, runChildUpdate: true, maxSize: 46 });

        this.scene.events.on('enemy_die', this.die, this);
        this.scene.events.on('enemy_projectile', this.projectile, this);
        this.scene.events.on('kill_enemy_projectile', this.killProjectile, this);

        // this.scene.time.addEvent({
        //     delay: 1000,
        //     callback: () =>
        //     {
        //         const x = Math.random() * GAME_WIDTH >> 0;
        //         const y = Math.random() * GAME_HEIGHT >> 0;
        //         const key = Math.random() > 0.5 ? 'eye' : 'bat';
        //         this.spawn(x, y, key);
        //     },
        //     loop: true
        // });
    }

    spawnBoss(key)
    {
        const sprite = this.bossPool.get();
        if (sprite) sprite.init(300, 86, key);
        return sprite;
    }

    killProjectile(projectile)
    {
        projectile.body.setEnable(false);
        this.projectiles.killAndHide(projectile);
    }

    projectile({ x, y, angle, atk, id })
    {
        const projectile = this.projectiles.get();
        if (projectile) projectile.init({ x, y, angle, name: 'enemy', id, atk })
        if (!projectile) console.log('000')
    }

    spawn(x, y, name)
    {
        const sprite = this.objectPool.get();
        if (sprite) sprite.init({ x, y, name });
    }

    die(sprite)
    {
        this.scene.events.emit('update_kill_count');
        sprite.body.setEnable(false);
        this.objectPool.killAndHide(sprite);
    }
}