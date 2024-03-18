import { BehaviorTreeNode } from "../../../system/behaviorTree/behaviorTreeNode.js";


export class IsAction extends BehaviorTreeNode
{

    constructor(blackboard)
    {
        super('IsAction', blackboard);
    }

    process(t, d)
    {
        const myself = this.blackboard.getData('myself');
        const state = myself.fsm.getState();

        if (state === 'idle') return 'Failure';
        return 'Success';
    }
}