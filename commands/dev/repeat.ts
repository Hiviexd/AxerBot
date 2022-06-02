import { Client, Message } from "discord.js";
import { owners } from "../../config.json";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "repeat",
	help: {
		description: "Developer-exclusive command that makes the bot send X amount of messages for testing purposes.\n Max is 200 to prevent abuse.",
		syntax: "{prefix}serverlist",
	},
	category: "dev",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (owners.includes(message.author.id)) {
			const amount = parseInt(args[0]);
			if (!amount) {
				message.channel.send(
					"❗ Please specify the amount of messages you want me to repeat."
				);
				setTimeout(() => {
					message.delete();
				}, 2000);
				return;
			}
			if (amount > 200 || amount < 1) {
				message.channel.send(
					"❗ Please specify an amount between 1 and 200."
				);
				setTimeout(() => {
					message.delete();
				}, 2000);
				return;
			}
		for (let i = 0; i < amount; i++) {
			setTimeout(() => {
				message.channel.send(`${i + 1}`);
			}, 500);
			
			}
		} else {
			message.reply({
				embeds: [
					generateErrorEmbed(
						"❌ **Only bot developers allowed to use this!**"
					),
				],
			});
			return;
		}
	},
};