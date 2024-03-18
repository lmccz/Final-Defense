import { BehaviorTreeNode } from "../../../system/behaviorTree/behaviorTreeNode.js";


export class SpawnMinion extends BehaviorTreeNode
{

    constructor(blackboard)
    {
        super('SpawnMinion', blackboard);
    }

    process(t, d)
    {
        const myself = this.blackboard.getData('myself');
        myself.fsm.transition('action', 'SpawnMinion');
        return 'RUNNING';
    }
}