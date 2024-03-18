export class SteeringBehaviors
{
    static orbit(entity, target, radius, clockwise = true)
    {
        const angle = Phaser.Math.Angle.Between(entity.x, entity.y, target.x, target.y);

        let targetAngle = angle;
        if (clockwise) targetAngle += Math.PI / 2;
        else targetAngle -= Math.PI / 2;

        const targetX = target.x + radius * Math.cos(targetAngle);
        const targetY = target.y + radius * Math.sin(targetAngle);

        const forceX = targetX - target.x;
        const forceY = targetY - target.y;

        return new Phaser.Math.Vector2(forceX, forceY).normalize();
    }
}
