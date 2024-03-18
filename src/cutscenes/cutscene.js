export class Cutscene {
    scripts = [];

    addScript(script) {
        this.scripts.push(script);
        return this;
    }

    async run() {
        for (let scriptAction of this.scripts) {
            await scriptAction();
        }

        return Promise.resolve();
    }
}