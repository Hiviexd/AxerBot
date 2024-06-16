import { ChatInputCommandInteraction } from "discord.js";
import { TaskStep } from "./TaskStep";

export interface StepTaskBuilderConstructorOptions {
    name: string;
    command: ChatInputCommandInteraction;
}

export class StepTaskBuilder {
    public readonly name: string;
    public readonly command: ChatInputCommandInteraction;
    private _currentStep = 0;
    private _steps: TaskStep[] = [];

    constructor({ name, command }: StepTaskBuilderConstructorOptions) {
        this.name = name;
        this.command = command;
    }

    private updateStepIndex(stepId: string) {
        const stepIndex = this._steps.findIndex((step) => step.id == stepId);

        if (stepIndex >= 0) this._steps[stepIndex].setIndex(stepIndex);

        return this;
    }

    public getStep(id: string) {
        return this._steps.find((step) => step.id == id);
    }

    public getFirstStep() {
        return this._steps[0];
    }

    public addStep(step: TaskStep) {
        this._steps.push(step);
        this.updateStepIndex(step.id);

        return this;
    }

    public async nextStep() {
        await this.command.editReply({
            content: "Loading...",
            embeds: [],
            components: [],
        });

        this.getStep(this._steps[this._currentStep + 1].id)?.execute(this.command, this);
    }

    public async previousStep() {
        await this.command.editReply({
            content: "Loading...",
            embeds: [],
            components: [],
        });

        this.getStep(this._steps[this._currentStep - 1].id)?.execute(this.command, this);
    }

    public async skipToStep(id: string) {
        await this.command.editReply({
            content: "Loading...",
            embeds: [],
            components: [],
        });

        this.getStep(id)?.execute(this.command, this);
    }

    public setCurrentStep(stepId: string) {
        const stepIndex = this._steps.findIndex((step) => step.id == stepId);

        this._currentStep = stepIndex;

        return this;
    }

    public begin() {
        this.getFirstStep().execute(this.command, this);
    }

    public get currentStep() {
        return this._currentStep;
    }
}
