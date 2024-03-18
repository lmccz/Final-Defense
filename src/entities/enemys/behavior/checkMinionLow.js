import { MINION_MAX_COUNT } from "../../../constant.js";
import { BehaviorTreeNode } from "../../../system/behaviorTree/behaviorTreeNode.js";


export class CheckMinionLow extends BehaviorTreeNode {

    constructor(blackboard) {
        super('CheckMinionLow', blackboard);
    }

    process(t, d) {
        const myself = this.blackboard.getData('myself');
        const count = MINION_MAX_COUNT - myself.scene.enemyManager.objectPool.getTotalUsed();
        if (count > MINION_MAX_COUNT / 2) return 'Failure';
        return 'Success';
    }
}