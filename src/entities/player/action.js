import StateMachine from "../../system/stateMachine.js";
import { Abilites, Weapon } from "./ability.js";


class IdleState
{
    enter(e)
    {
        Weapon[e.equip].enterIdle(e);
    }

    execute(t, d, e)
    {
        Weapon[e.equip].executeIdle(e);
    }
}


class ActionState
{
    stateIndex = 0;
    action = false;
    timeout = 1000;

    enter(e, stateIndex)
    {
        this.stateIndex = stateIndex;
        this.action = true
        this.timeout = 1000;
        Weapon[e.equip].enterAction(e, this);
    }

    execute(t, d, e)
    {
        this.timeout -= d;

        if (this.timeout <= 0)
        {
            this.stateMachine.transition('idle');
            return;
        }

        if (this.action) return;
        Weapon[e.equip].executeAction(e, this);
    }
}


export class ActionSystem
{
    scene;
    character;
    fsm;
    equip = 'sword';

    abilities = [];
    body;
    radian = 0;
    pointerAngle = 0;
    cd = 300;
    timer = 0;
    keydown = false;

    constructor(character,weaponKey)
    {
        this.scene = character.scene;
        this.character = character;
        this.equip = weaponKey;

        this.equipSprite = character.scene.add.image(character.container.x, character.container.y, 'sword2');
        this.equipSprite.setOrigin(1, 0.5);
        this.equipSprite.setPipeline('Light2D');
        this.equipSprite.setVisible(false);
        this.equipSprite.setDepth(999)

        this.slice = character.scene.add.image(character.container.x, character.container.y, 'slice');
        this.slice.setPipeline('Light2D');
        this.slice.setOrigin(1, 0.5);
        this.slice.setVisible(false);
        this.slice.setDepth(999)

        this.body = character.scene.physics.add.body(character.container.x, character.container.y, 30, 30);

        this.fsm = new StateMachine('idle', {
            'idle': new IdleState,
            'action': new ActionState,
        }, [this]);

        this.setEquip(this.equip);
    }

    setEquip(key)
    {
        const texture = Weapon[key].texture;
        this.equipSprite.setTexture(texture);
        this.equipSprite.setAngle(0);
        this.equipSprite.setScale(1, 1);
        this.slice.setVisible(false);
        this.fsm.transition('idle');
    }

    attack(angle, radian)
    {
        const { x, y } = this.character.container;

        this.pointerAngle = angle;
        this.radian = radian
        this.keydown = true;

        this.equipSprite.setPosition(x + Math.cos(radian) * 4, y + Math.sin(radian) * 4);
        this.slice.setPosition(x + Math.cos(radian) * 8, y + Math.sin(radian) * 8);
        this.body.position.set(x + Math.cos(radian) * 16 - 4, y + Math.sin(radian) * 16 - 6);

        // this.equipSprite.setDepth(this.equipSprite.y >> 0);
        // this.slice.setDepth(this.slice.y >> 0);
    }

    update(t, d)
    {
        this.fsm.step(t, d);
        this.keydown = false;

        this.abilities.forEach((e, i) =>
        {
            this.abilities[i].timer -= d;
            if (this.abilities[i].timer <= 0)
            {
                this.abilities[i].timer = e.cd;
                Abilites[e.key].start(this);
            }
        });
    }
}