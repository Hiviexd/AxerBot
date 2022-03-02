import { Client, Message } from "discord.js";

const { ownerId } = require("../../config.json");

export default {
	run: async (bot: Client, message: Message, args: string[]) => {
		//let whitelist = ['Owner', 'Host', 'Judge', 'Moderator', 'Mod'];
		//let bool = message.member.roles.cache.some((role) => whitelist.some(wl => role === wl))

		if (!message.member) return;

		if (
			!message.member.roles.cache.find(
				(role) =>
					role.name === "Host" ||
					role.name === "Judge" ||
					role.name === "Owner" ||
					role.name === "Moderator"
			) &&
			message.author.id !== ownerId
		) {
			let msg = await message.channel.send(
				":x: You don't have the permission to use this command!"
			);
			setTimeout(() => {
				msg.delete();
			}, 2000);
			return;
		}

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
