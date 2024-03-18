import { BehaviorTreeNode } from "../../../system/behaviorTree/behaviorTreeNode.js";


export class ExecuteAbility extends BehaviorTreeNode
{

    constructor(blackboard)
    {
        super('ExecuteAbility', blackboard);
    }

    process(t, d)
    {
        const myself = this.blackboard.getData('myself');
        const ability = this.blackboard.getData('useAbility');
        myself.fsm.transition('action', ability);
        return 'RUNNING';
    }
}