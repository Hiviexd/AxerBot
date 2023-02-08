import * as dotenv from "dotenv";
dotenv.config();
const token = process.env.TOKEN;
import "colors";
import { Client, IntentsBitField, Message } from "discord.js";
import commandHandler from "./helpers/core/commandHandler";
import "./helpers/osu/fetcher/startConnection";
import keepAlive from "./server";
import { consoleCheck } from "./helpers/core/logger";
import eventHandler from "./helpers/core/eventHandler";
import registerCommands from "./helpers/interactions/registerCommands";

const bot = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.GuildMessageTyping,
		IntentsBitField.Flags.DirectMessageTyping,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.DirectMessageReactions,
	],
});

keepAlive();

bot.login(token).then(() => {
	eventHandler(bot);
	registerCommands(bot);
	consoleCheck("index.ts", "Running and listening to commands!");
});
