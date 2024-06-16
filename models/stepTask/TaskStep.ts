import { randomBytes } from "crypto";
import { ChatInputCommandInteraction } from "discord.js";
import { StepTaskBuilder } from "./StepTaskBuilder";

export class TaskStep {
    private _id: string = randomBytes(25).toString("hex");
    private _executable = (command: ChatInputCommandInteraction, task: StepTaskBuilder) => {};
    private _index = 0;

    constructor() {}

    public execute(command: ChatInputCommandInteraction, task: StepTaskBuilder) {
        this._executable(command, task);
        task.setCurrentStep(this.id);
    }

    public setExecutable(fn: typeof this._executable) {
        this._executable = fn;

        return this;
    }

    public setIndex(index: number) {
        this._index = index;
    }

    public setId(id: string) {
        this._id = id;

        return this;
    }

    public get id() {
        return this._id;
    }

    public get index() {
        return this._index;
    }
}
