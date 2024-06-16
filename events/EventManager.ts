import { AxerBot } from "../models/core/AxerBot";
import { CommandsManager } from "./CommandsManager";
import { InteractionManager } from "./InteractionManager";

export class EventManager {
    public readonly axer: AxerBot;
    public readonly CommandsManager: CommandsManager;
    public readonly InteractionManager: InteractionManager;

    constructor(axer: AxerBot) {
        this.axer = axer;
        this.CommandsManager = new CommandsManager(this.axer);
        this.InteractionManager = new InteractionManager(this);
    }

    public initialize() {
        this.axer.on("interactionCreate", (i) => this.InteractionManager.handleInteraction(i));
    }
}
