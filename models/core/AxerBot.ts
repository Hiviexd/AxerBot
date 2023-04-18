import { Client, ClientOptions } from "discord.js";
import { LoggerClient } from "./LoggerClient";
import { config } from "dotenv";
import { DiscussionEventsManager } from "../bancho/DiscussionEventsManager";
import { existsSync, mkdirSync } from "fs";
import eventHandler from "../../helpers/core/eventHandler";
import registerCommands from "../../helpers/interactions/registerCommands";
import { startAvatarListener } from "../../modules/avatar/avatarManager";
import { connectToBancho } from "../../modules/bancho/client";

export class AxerBot extends Client {
    public Logger = new LoggerClient("AxerBot Client");
    public Discussions = new DiscussionEventsManager();

    constructor(options: ClientOptions) {
        super(options);
        this.checkCacheFolders();
    }

    start() {
        this.Logger.printInfo("Starting AxerBot...");
        this.login(process.env.TOKEN).then(() => {
            connectToBancho();
            eventHandler(this);
            registerCommands(this);
            startAvatarListener(this);

            this.Logger.printSuccess(`${this.user?.username} is online!`);
        });
        this.Discussions.listen();

        return this;
    }

    private checkCacheFolders() {
        if (!existsSync("./cache")) mkdirSync("./cache");
        if (!existsSync("./temp/spectro/audio"))
            mkdirSync("./temp/spectro/audio", { recursive: true });
        if (!existsSync("./temp/spectro/images"))
            mkdirSync("./temp/spectro/images", { recursive: true });
    }
}
