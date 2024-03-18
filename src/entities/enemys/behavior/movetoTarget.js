import { BehaviorTreeNode } from "../../../system/behaviorTree/behaviorTreeNode.js";


export class MovetoTarget extends BehaviorTreeNode {

    constructor(blackboard) {
        super('MovetoTarget', blackboard);
    }

    process(t, d) {
        const myself = this.blackboard.getData('myself');
        let { x, y } = this.blackboard.getData('target');
        myself.fsm.transition('walk', { x, y });
        return 'RUNNING';
    }
}