import { Client, Message } from "discord.js";
import MissingPermissions from "./../../data/embeds/MissingPermissions";
import { ownerId } from "../../config.json";

export default {
	name: "purge",
	help: {
		description: "Deletes x amount of messages from a channel",
		syntax: "{prefix}purge `<count>`",
		example: "{prefix}purge `6`",
	},
	category: "management",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.member) return;
		if (
			!message.member.permissions.has("MANAGE_MESSAGES", true) &&
			message.author.id !== ownerId
		)
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

		if (amount > 100 || amount < 1) {
			let msg = await message.channel.send(
				":exclamation: Please specify an amount between 1 and 100."
			);
			setTimeout(() => {
				msg.delete();
			}, 2000);
			return;
		}

		if (!message.guild) return;

		const channel: any = message.channel;
		channel.bulkDelete(amount + 1).catch(() => {
			message.channel.send(
				":x: Due to Discord Limitations, I cannot delete messages older than 14 days."
			);
		});

		let msg = await message.channel.send(
			`:white_check_mark: Deleted \`${amount}\` messages!`
		);
		setTimeout(() => {
			msg.delete();
		}, 2000);
	},
};
