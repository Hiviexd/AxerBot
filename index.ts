import * as dotenv from "dotenv";
dotenv.config();
const token = process.env.TOKEN;

import "colors";
import { Client, EmbedBuilder, IntentsBitField, Message } from "discord.js";
import "./modules/osu/fetcher/startConnection";
import keepAlive from "./server";
import { consoleCheck } from "./helpers/core/logger";
import eventHandler from "./helpers/core/eventHandler";
import registerCommands from "./helpers/interactions/registerCommands";
import { connectToBancho } from "./modules/bancho/client";
import { startAvatarListener } from "./modules/avatar/avatarManager";
import { listenMapperTracker } from "./modules/mappertracker/mapperTrackerManager";
import fs from "fs";
import colors from "./constants/colors";

export const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.DirectMessageTyping,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.DirectMessageTyping,
    ],
});

keepAlive();

// ? create missing folders
if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");
if (!fs.existsSync("./temp/spectro/audio"))
    fs.mkdirSync("./temp/spectro/audio", { recursive: true });
if (!fs.existsSync("./temp/spectro/images"))
    fs.mkdirSync("./temp/spectro/images", { recursive: true });

bot.login(token).then(() => {
    connectToBancho();
    eventHandler(bot);
    registerCommands(bot);
    startAvatarListener(bot);
    listenMapperTracker();
    consoleCheck("index.ts", "Running and listening to commands!");
});
