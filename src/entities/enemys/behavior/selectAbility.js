import { BehaviorTreeNode } from "../../../system/behaviorTree/behaviorTreeNode.js";


export class SelectAbility extends BehaviorTreeNode
{

    constructor(blackboard)
    {
        super('SelectAbility', blackboard);
    }

    process(t, d)
    {
        const myself = this.blackboard.getData('myself');
        const ability = myself.getAbility();
        this.blackboard.setData('useAbility', ability);
        return 'Success';
    }
}