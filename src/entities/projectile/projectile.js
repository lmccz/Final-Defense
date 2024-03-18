import { GAME_WIDTH } from "../../constant.js";


const Projectiles = {
    0: { texture: 'bullet', speed: 186, move: 'parabola', gravity: -160 },
    1: { texture: 'flamethrower_bullet', speed: 186, move: 'orbit', gravity: -160 },
    2: { texture: 'arrow', speed: 246, move: 'line', gravity: -160 },
    3: { texture: 'fireball', speed: 186, move: 'line', gravity: -160 },
    4: { texture: 'bulletb', speed: 180, move: 'parabola', gravity: -160 },
    5: { texture: 'flamethrower_bullet', speed: 246, move: 'parabola', gravity: -160 },
}


const Temp1 = new Phaser.Math.Vector2(0, 0);


const Movements = {
    'line': (e, time, delta) =>
    {
        e.scene.physics.velocityFromAngle(e.angle, e.speed, e.body.velocity);
        e.shadow.setPosition(e.x, e.y + 4);

        if (e.particleTime <= 0)
        {
            e.scene.events.emit('fx_pathParticle', { x: e.x, y: e.y });
            e.particleTime = 80;
        }
    },
    'orbit': (e, time, delta) =>
    {
        let target = { x: GAME_WIDTH / 2, y: -30 };
        if (e.target && e.target.active) target = e.target;

        // const x = Phaser.Math.Linear(e.x, target.x, 1);
        // const y = Phaser.Math.Linear(e.y, target.y, 1);
        const a = Phaser.Math.Angle.BetweenPoints(e, e.target);
        const rotation = Phaser.Math.Linear(a, 6.2, 0.1);

        e.setRotation(rotation)
        e.scene.physics.velocityFromRotation(rotation, e.speed, e.body.velocity);
        e.scene.events.emit('fx_pathParticle', { x: e.x, y: e.y });
        e.shadow.setPosition(e.x, e.y + 4);
    },
    'parabola': (e, time, delta) =>
    {
        let vx = e.speed / 10 * Math.cos(e.rotation);
        let vy = -e.speed / 10 * Math.sin(e.rotation);
        let x = e.x
        let y = e.y
        let timeStep = 0.1

        let ax = 0;
        e.ay += 1;
        vx += ax * timeStep;
        vy += e.ay * timeStep;
        x += vx * timeStep;
        y += vy * timeStep;

        e.setPosition(x, y);
        e.setRotation(Math.atan2(vy, vx));

        e.t += timeStep;
        e.shadow.x = e.x;

        if (e.particleTime <= 0)
        {
            e.scene.events.emit('fx_pathParticle', { x: e.x, y: e.y });
            e.particleTime = 80;
        }
    }
}


export class Projectile extends Phaser.GameObjects.Image
{

    timer = 2000;
    particleTime = 160;
    atk = 1;
    tx = 0;
    ty = 0;
    speed = 20;
    // velocityVector = new Phaser.Math.Vector2(0, 0);

    constructor(scene)
    {
        super(scene, 0, 0);
        scene.physics.world.enable(this);

        this.setAlpha(0.8)

        this.shadow = scene.add.image(0, 0, '');
        this.shadow.setAlpha(0.3);
        this.shadow.setTint(0x000000);
        this.shadow.setActive(false);
        this.shadow.setVisible(false);

        this.body.setSize(4, 4);
        this.body.setOffset(4, 4);
        this.setPipeline('Light2D');
    }

    handOverlap(target = false)
    {
        if (target) target.takeDamage(this.atk);
        this.kill();
    }

    init({ x, y, angle, name, id, atk, target })
    {
        const { texture, speed, move, gravity } = Projectiles[id];
        this.speed = speed;
        this.atk = atk;
        this.timer = 600;
        this.move = move;
        this.t = 0
        this.ay = gravity;
        this.target = target;

        this.body.setEnable(true);
        this.body.setVelocity(0, 0);
        this.body.gravity.y = 120;

        this.shadow.setTexture(texture);
        this.shadow.setPosition(x, y + 3);
        this.shadow.setActive(true);
        this.shadow.setVisible(true);

        this.setTexture(texture);
        this.setName(name);
        this.setPosition(x, y);
        this.setRotation(angle);
        this.setDepth(999);
        this.setActive(true);
        this.setVisible(true);
    }

    kill()
    {
        if (!this.active) return;
        this.scene.events.emit('walk_particles', this.x, this.y);
        this.shadow.setActive(false);
        this.shadow.setVisible(false);
        this.scene.events.emit(`kill_${this.name}_projectile`, this);
    }

    update(t, d)
    {
        if (!this.active) return;

        this.timer -= d;
        this.particleTime -= d;
        this.shadow.angle = this.angle;

        if (this.timer <= 0 && this.active)
        {
            this.kill();
            return;
        }

        Movements[this.move](this, t, d);
    }
}