import { Client, Message } from "discord.js";
import { owners } from "../../config.json";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "repeat",
	help: {
		description: "Developer-exclusive command that makes the bot send X amount of messages for testing purposes.\n Max is 200 to prevent abuse.",
		syntax: "{prefix}repeat `<amount>` `<optionalMsg>`",
		example: "{prefix}repeat `10` `Hello World!`\n{prefix}repeat `7`",
	},
	category: "dev",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (owners.includes(message.author.id)) {
			const amount = parseInt(args[0]);
			if (!amount) {
				message.channel.send({
					embeds: [
						generateErrorEmbed(
							"❗ You need to specify the amount of messages to send."
						),
					],
				});
				//// setTimeout(() => {
				////	message.delete();
				////}, 2000);
				return;
			}
			if (amount > 200 || amount < 1) {
				message.channel.send({
					embeds: [
						generateErrorEmbed(
							"❗ The amount of messages to send must be between 1 and 200."
						),
					],
				});
				return;
			}
			const msg = args.slice(1).join(" ");
			
		for (let i = 0; i < amount; i++) {
			setTimeout(() => {
				message.channel.send(`${msg ? msg :i + 1}`);
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