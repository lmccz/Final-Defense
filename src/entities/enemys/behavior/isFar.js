import { BehaviorTreeNode } from "../../../system/behaviorTree/behaviorTreeNode.js";


export class IsFar extends BehaviorTreeNode {

    constructor(blackboard) {
        super('IsFar', blackboard);
    }

    process(t, d) {
        const myself = this.blackboard.getData('myself');
        const target = this.blackboard.getData('target');
        if (Phaser.Math.Distance.BetweenPoints(myself, target) > myself.range) return 'Failure';
        return 'Success';
    }
}