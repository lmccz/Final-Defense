export class Idle
{
    timer = 1000;

    enter(e)
    {
        e.idle();
        this.timer = 1000;
    }

    execute(t, d, e)
    {
        this.timer -= d;

        if (this.timer > 0) return; 

        if (Phaser.Math.Distance.BetweenPoints(e, e.scene.player.container) > e.range)
        {
            const x = e.scene.player.container.x + Math.cos(t) * 6;
            const y = e.scene.player.container.y + Math.sin(t) * 6;
            this.stateMachine.transition('move', { x, y });
            return;
        }

        this.timer = 1000;
    }
}