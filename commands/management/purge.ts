import { Client, Message } from "discord.js";
import MissingPermissions from "./../../data/embeds/MissingPermissions";
import { ownerId } from "../../config.json";
import generateConfirmationEmbed from "./../../helpers/text/embeds/generateConfirmationEmbed";

export default {
	name: "purge",
	help: {
		description: "Deletes x amount of messages from a channel.\nMax amount is `98` because of Discord limitations.",
		syntax: "{prefix}purge `<count>`",
		example: "{prefix}purge `6`",
	},
	category: "management",
	run: async (bot: Client, message: Message, args: string[]) => {
		
	let purge = () => {
		channel.bulkDelete(amount + 2).catch(() => {
			channel.send(
				":x: Due to Discord Limitations, I cannot delete more than 98 messages, or messages older than 14 days."
			);
		});
	}

		if (!message.member) return;
		if (
			!message.member.permissions.has("MANAGE_MESSAGES", true) && message.author.id !== ownerId)
			return message.channel.send({ embeds: [MissingPermissions] });

		var amount = parseInt(args[0]);

		if (!amount) {
			let msg = await message.channel.send(
				":exclamation: Please specify the amount of messages you want me to delete."
			);
			setTimeout(() => {
				msg.delete();
			}, 2000);
			return;
		}

		if (amount > 98 || amount < 1) {
			let msg = await message.channel.send(
				":exclamation: Please specify an amount between 1 and 98."
			);
			setTimeout(() => {
				msg.delete();
			}, 2000);
			return;
		}

		if (!message.guild) return;

		const channel: any = message.channel;

		generateConfirmationEmbed(message, purge, "This action **cannot** be undone, be careful.");
	},
};
