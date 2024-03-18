export default class Particles
{
    static emitterConfigs = Object.create(null);

    particles = Object.create(null);
    playing = Object.create(null);
    scene = undefined;

    constructor(scene)
    {
        this.scene = scene;
    }

    static addEmitter(key, config)
    {
        Particles.emitterConfigs[key] = config;
    }

    // {name, emitters:[{key:"",texture:"",depth:Number}]}
    createParticleEmitter(name, emitters)
    {
        this.particles[name] = [];

        emitters.forEach(config =>
        {
            const { key, texture, depth } = config;
            const emitter = this.scene.add.particles(0, 0, texture);

            emitter.setPipeline('Light2D');
            emitter.setDepth(depth);
            emitter.setConfig(Particles.emitterConfigs[key]);

            this.particles[name].push(emitter);
        });

        this.playing[name] = 1;
        this.stop(name);

        return this.particles[name];
    }

    emitParticleAt(key, x, y)
    {
        this.particles[key].forEach(e =>
        {
            e.emitParticleAt(x, y)
        });
    }

    setPosition(key, x, y)
    {
        this.particles[key].forEach(e =>
        {
            e.setPosition(x, y)
        });
    }

    start(key)
    {
        if (!this.playing[key])
        {
            this.playing[key] = 1;
            this.particles[key].forEach(e => { e.start(); });
        }
    }

    stop(key)
    {
        if (this.playing[key])
        {
            this.playing[key] = 0;
            this.particles[key].forEach(e => { e.stop(); });
        }
    }

    destroy()
    {
        this.playing = undefined;

        for (const key of Object.keys(this.particles))
        {
            this.particles[key].forEach(e => { e.destroy(); });
        }

        this.particles = undefined;
    }
}