// 行为树中的黑板模块可以存储任意类型的数据
export class Blackboard {

    constructor() {
        // 数据字典
        this.dataDictionary = Object.create(null);
    }

    setData(key, data) {
        this.dataDictionary[key] = data;
    }

    getData(key) {
        return this.dataDictionary[key];
    }
}