export class Idle
{
    timer = 0
    enter(e)
    {
        e.idle();
    }

    execute(t, d, e)
    {
        if (e.keys.w.isDown || e.keys.a.isDown || e.keys.s.isDown || e.keys.d.isDown)
        {
            this.stateMachine.transition('walk');
            return;
        }
    }
}


export class Walk
{
    particleTimer = 0;
    ismove = false;

    enter(e)
    {
        e.walk();
    }

    execute(t, d, e)
    {
        this.ismove = false;

        this.particleTimer -= d;
        if (this.particleTimer <= 0)
        {
            this.particleTimer = 360;
            e.scene.events.emit('walk_particles', e.container.x, e.container.y + 8);
        }

        if (e.keys.w.isDown)
        {
            e.direction = 0;
            e.container.body.setVelocityY(-e.speed);
            this.ismove = true;
        }

        if (e.keys.a.isDown)
        {
            e.direction = 3
            e.container.body.setVelocityX(-e.speed);
            this.ismove = true;
        }

        if (e.keys.s.isDown)
        {
            e.direction = 2
            e.container.body.setVelocityY(e.speed);
            this.ismove = true;
        }

        if (e.keys.d.isDown)
        {
            e.direction = 1
            e.container.body.setVelocityX(e.speed);
            this.ismove = true;
        }

        if (this.ismove) return;
        this.stateMachine.transition('idle');
    }
}


export class Dash
{
    target;

    enter(e, target)
    {
        e.walk();
        this.target = target;
    }

    execute(t, d, e)
    {
        const rotation = Phaser.Math.Angle.BetweenPoints(e.container, this.target);
        e.scene.physics.velocityFromRotation(rotation, e.speed * 3, e.container.body.velocity);

        if (Phaser.Math.Distance.BetweenPoints(e.container, this.target) <= 3)
        {
            this.stateMachine.transition('idle');
            return;
        }

        e.scene.events.emit('fx_phantom', e.container.x, e.container.y);
    }
}

