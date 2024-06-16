import { readdirSync } from "fs";
import { AxerBot } from "../models/core/AxerBot";
import { CommandsManager } from "./CommandsManager";
import { InteractionManager } from "./InteractionManager";
import path from "path";
import { EventObject } from "../struct/events/EventObject";
import { ClientEvents } from "discord.js";
import { ClientReadyEvent } from "./client/ClientReadyEvent";
import { GuildBanAddEvent } from "./guild/GuildBanAddEvent";
import { GuildBanRemoveEvent } from "./guild/GuildBanRemoveEvent";
import { GuildCreateEvent } from "./guild/GuildCreateEvent";
import { GuildMemberAddEvent } from "./guild/GuildMemberAddEvent";
import { GuildMemberRemoveEvent } from "./guild/GuildMemberRemoveEvent";
import { MessageCreateEvent } from "./message/MessageCreateEvent";
import { MessageUpdateEvent } from "./message/MessageUpdateEvent";
import { MessageDeleteEvent } from "./message/MessageDeleteEvent";
import { VoiceStateUpdateEvent } from "./voice/VoiceStateUpdateEvent";

export class EventManager {
    public readonly axer: AxerBot;
    public readonly CommandsManager: CommandsManager;
    public readonly InteractionManager: InteractionManager;

    constructor(axer: AxerBot) {
        this.axer = axer;
        this.CommandsManager = new CommandsManager(this.axer);
        this.InteractionManager = new InteractionManager(this);
    }

    public async initialize() {
        for (const handler of this.handlers) {
            this.axer.on(handler.eventName, handler.handle.bind(handler));
        }

        this.axer.on("interactionCreate", (i) => this.InteractionManager.handleInteraction(i));
    }

    public getHandler<K extends keyof ClientEvents>(eventName: K) {
        return this.handlers.find((handler) => handler.eventName == eventName);
    }

    public get handlers() {
        return [
            ClientReadyEvent,
            GuildBanAddEvent,
            GuildBanRemoveEvent,
            GuildCreateEvent,
            GuildMemberAddEvent,
            GuildMemberRemoveEvent,
            MessageCreateEvent,
            MessageDeleteEvent,
            MessageUpdateEvent,
            VoiceStateUpdateEvent,
        ];
    }
}
