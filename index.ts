import * as dotenv from "dotenv";
dotenv.config();
const token = process.env.TOKEN;
import "colors";
import { Client, Intents, Message } from "discord.js";
import commandHandler from "./helpers/core/commandHandler";
import "./helpers/osu/fetcher/startConnection";
import keepAlive from "./server";
import { consoleCheck } from "./helpers/core/logger";
import eventHandler from "./helpers/core/eventHandler";

const bot = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGE_TYPING,
	],
});

keepAlive();

bot.login(token).then(() => {
	eventHandler(bot);
	consoleCheck("index.ts", "Running and listening to commands!");
});
