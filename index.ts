import * as dotenv from "dotenv";
dotenv.config();
const token = process.env.TOKEN;
import "colors";
import { Client, Intents, Message } from "discord.js";
import commands from "./commands";
import commandHandler, {
	interactionHandler,
	startCommands,
} from "./utils/core/commandHandler";
import "./utils/osu/osuApiConnetion";
import keepAlive from "./server";
import { consoleCheck } from "./utils/core/logger";
import eventHandler from "./utils/core/eventHandler";

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

bot.on("messageCreate", async (message: Message) => {
	commandHandler(bot, message);
});

bot.on("interaction", (interaction) => {
	if (!interaction.isCommand()) return;

	interactionHandler(interaction, bot);
});

keepAlive();
bot.login(token).then(async () => {
	startCommands(bot);
	eventHandler(bot);
	consoleCheck("index.ts", "Running and listening to commands!");
});
