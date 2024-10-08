import { Client, ClientOptions } from "discord.js";
import { LoggerClient } from "./LoggerClient";
import { DiscussionEventsListener } from "./DiscussionEventsListener";
import { existsSync, mkdirSync } from "fs";
// import { startAvatarListener } from "../../modules/avatar/avatarManager";
import { handleDiscussionEvent } from "../../modules/osu/events/handleDiscussionEvent";
import { UserEventsListener } from "./UserEventsListener";
import { handleMapperTrackerUserEvent } from "../../modules/tracking/mapperTracker";
import { RemindersManager } from "../../modules/reminders/remindersChecker";
import { AxerBancho } from "../../modules/bancho/client";
import { TempFileDeletionManager } from "../../modules/osu/helpers/TempFileDeletionManager";
import "../../modules/osu/fetcher/startConnection";
import "../../modules/automation/start";
import { QATTracker } from "../../modules/tracking/qatTracking";
import { EventManager } from "../../events/EventManager";

export class AxerBot extends Client {
    public Logger = new LoggerClient("AxerBot Client");
    public Discussions = new DiscussionEventsListener();
    public UserEvents = new UserEventsListener();
    public Reminders = new RemindersManager(this);
    public Bancho = new AxerBancho(this);
    public QatTracker = new QATTracker(this);
    public TempFileDeletionManager = new TempFileDeletionManager();
    public EventManager = new EventManager(this);

    constructor(options: ClientOptions) {
        super(options);
        this.checkCacheFolders();
    }

    start() {
        this.Logger.printInfo("Starting AxerBot...");

        this.Discussions.listen.bind(this.Discussions);
        this.Discussions.events.on.bind(this.Discussions);
        this.UserEvents.listen.bind(this.UserEvents);
        this.UserEvents.events.on.bind(this.UserEvents);
        this.TempFileDeletionManager.listen.bind(this.TempFileDeletionManager);
        this.QatTracker.listen.bind(this);

        this.login(process.env.TOKEN).then(() => {
            this.Bancho.connect().catch(console.error);

            this.EventManager.initialize();
            this.EventManager.CommandsManager.initializeCommands();

            // ? temp disabled as it seems broken for now
            // startAvatarListener(this);

            this.Reminders.start();

            this.QatTracker.listen();

            this.TempFileDeletionManager.listen();

            this.Discussions.listen();
            this.Discussions.events.on("any", handleDiscussionEvent);

            this.UserEvents.listen();
            this.UserEvents.events.on("any", handleMapperTrackerUserEvent);

            this.Logger.printSuccess(`${this.user?.username} is online!`);
        });

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
