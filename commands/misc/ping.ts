import { Client, Message } from "discord.js";

export default {
	name: "ping",
	run: async (bot: Client, message: Message, args: string[]) => {
		return message.channel.send("`" + bot.ws.ping + " ms`");
	},
};
