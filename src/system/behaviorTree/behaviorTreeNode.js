export class BehaviorTreeNode
{
    constructor(name, blackboard)
    {
        this.name = name;
        this.blackboard = blackboard;
    }

    tick(t, d)
    {
        this.preprocess(t, d);
        const status = this.process(t, d);
        return this.emitStatus(status);
    }

    preprocess(t, d) { }

    process(t, d) { }

    emitStatus(status)
    {
        return status;
    }
}