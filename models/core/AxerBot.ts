import { Client, ClientOptions } from "discord.js";
import { LoggerClient } from "./LoggerClient";
import "../../modules/osu/fetcher/startConnection";
import { DiscussionEventsListener } from "./DiscussionEventsListener";
import { existsSync, mkdirSync } from "fs";
import eventHandler from "../../helpers/core/eventHandler";
import registerCommands from "../../helpers/interactions/registerCommands";
import { startAvatarListener } from "../../modules/avatar/avatarManager";
import { connectToBancho } from "../../modules/bancho/client";
import { handleDiscussionEvent } from "../../modules/osu/events/handleDiscussionEvent";
import { UserEventsListener } from "./UserEventsListener";
import { handleMapperTrackerUserEvent } from "../../modules/tracking/mapperTracker";
import { RemindersManager } from "../../modules/reminders/remindersChecker";

export class AxerBot extends Client {
    public Logger = new LoggerClient("AxerBot Client");
    public Discussions = new DiscussionEventsListener();
    public UserEvents = new UserEventsListener();
    public Reminders = new RemindersManager(this);

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
            this.Reminders.start();

            this.Logger.printSuccess(`${this.user?.username} is online!`);
        });
        this.Discussions.listen();
        this.Discussions.events.on("any", handleDiscussionEvent);

        this.UserEvents.listen();
        this.UserEvents.events.on("any", handleMapperTrackerUserEvent);

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
