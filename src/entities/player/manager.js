import { Projectile } from "../projectile/projectile.js";


export class PlayerProjectile
{
    projectiles;
    scene;

    constructor(scene)
    {
        this.scene = scene;
        this.projectiles = scene.add.group({ classType: Projectile, runChildUpdate: true, maxSize: 32 });

        this.scene.events.on('start_player_projectile', this.projectile, this);
        this.scene.events.on('kill_player_projectile', this.killProjectile, this);
    }

    killProjectile(projectile)
    {
        projectile.body.setEnable(false);
        this.projectiles.killAndHide(projectile);
    }

    projectile(config)
    {
        const projectile = this.projectiles.get();
        if (projectile)
        {
            projectile.init({ name: 'player', ...config })
        }
    }
}