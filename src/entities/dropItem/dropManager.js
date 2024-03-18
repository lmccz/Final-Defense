import { DropItem } from "./dropItem.js";


export const DropItems = [
    {
        key: 'heart', texture: 'heart', anims: 'heart_anims', pickup: item =>
        {
            item.scene.events.emit('heal', 1);
            item.scene.events.emit('exp', 1);
        }
    }
];


export class DropManager
{
    objectPool;

    constructor(scene)
    {
        this.scene = scene;
        this.objectPool = scene.add.group({ classType: DropItem, maxSize: 16 });

        scene.events.on('drop_item', ({ x, y }) =>
        {
            const dropItem = this.objectPool.get();
            if (dropItem)
            {
                const { texture, anims, key } = DropItems[Math.random() * DropItems.length >> 0];
                dropItem.init({ x, y, texture, anims, key })
            }
        });

        scene.events.on('kill_drop_item', dropItem =>
        {
            dropItem.body.setEnable(false);
            this.objectPool.killAndHide(dropItem);
        });
    }
}