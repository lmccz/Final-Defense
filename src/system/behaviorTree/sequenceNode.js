import { BehaviorTreeNode } from "./behaviorTreeNode.js";
import { BehaviorStatus } from "./behaviorStatus.js";


// 顺序节点(Sequence)

// 该节点会从左到右的依次执行其子节点，只要子节点返回“成功”，
// 就继续执行后面的节点，直到有一个节点返回“运行中”或“失败”时，
// 会停止后续节点的运行，并且向父节点返回“运行中”或“失败”，
// 如果所有子节点都返回“成功”则向父节点返回“成功”。
export class SequenceNode extends BehaviorTreeNode {
    constructor(name, blackboard, nodes = []) {
        super(name, blackboard);
        this.nodes = nodes;
    }

    process(t, d) {
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const status = node.tick(t, d);

            if (status !== BehaviorStatus.SUCCESS) {
                return status;
            };
        };

        return BehaviorStatus.SUCCESS;
    }
}