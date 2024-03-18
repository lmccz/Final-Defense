import { BehaviorTreeNode } from "./behaviorTreeNode.js";
import { BehaviorStatus } from "./behaviorStatus.js";


//选择节点/优先选择节点(Selector)

// 该节点会从左到右的依次执行其子节点，只要子节点返回“失败”，
// 就继续执行后面的节点，直到有一个节点返回“运行中”或“成功”时，
// 会停止后续节点的运行，并且向父节点返回“运行中”或“成功”，
// 如果所有子节点都返回“失败”则向父节点返回“失败”
export class SelectorNode extends BehaviorTreeNode {
    constructor(name, blackboard, optionA, optionB) {
        super(name, blackboard);

        this.optionA = optionA;
        this.optionB = optionB;
    }

    process(t, d) {
        const status = this.optionA.tick(t, d);
        if (status === BehaviorStatus.FAILURE) {
            return this.optionB.tick(t, d);
        }
        return status;
    }
}