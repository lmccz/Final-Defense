const Funcs = {
    'talk': async scene => { scene.conversation.next(); },
    'dash': (scene, config) => { scene.events.emit('player_dash', config) },
    'attack': (scene, config) => { scene.events.emit('player_attack', config) },
}


export class InputHandler
{

    scene = undefined;
    state = 'none';

    constructor(scene)
    {
        this.scene = scene;

        this.scene.input.on('pointerup', pointer =>
        {
            const t = { x: pointer.worldX, y: pointer.worldY };

            if (Funcs[this.state] && this.state != 'none' && pointer.leftButtonReleased())
            {
                Funcs[this.state](this.scene, t);
                return;
            }

            if (pointer.rightButtonReleased())
            {
                Funcs['dash'](this.scene, t);
                return;
            }
        });
    }
}