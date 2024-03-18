export class Move
{
    timer = 0;
    moveTarget;

    enter(e, { x, y })
    {
        e.walk(x, y);
        this.moveTarget = { x, y };
    }

    execute(t, d, e)
    {
        this.timer -= d;
        
        if (this.timer <= 0)
        {
            this.timer = 360;
            e.scene.events.emit('walk_particles', e.x, e.y + 8);
        }

        if (Phaser.Math.Distance.BetweenPoints(this.moveTarget, e) < 1)
        {
            this.stateMachine.transition('idle');
            return;
        }
    }
}