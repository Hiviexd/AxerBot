import { Client, Message } from "discord.js";
const { ownerId } = require("../../config.json");

export default {
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.member || !message.guild) return;

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

		let lastArg = args[args.length - 1];
		args.pop();
		let toSay = args.join(" ");
		let destination = message.guild.channels.cache.find(
			(channel) => channel.name === lastArg
		);

		if (!toSay) {
			let msg = await message.channel.send(
				":exclamation: Please specify the message you want to send."
			);
			setTimeout(() => {
				msg.delete();
			}, 2000);
			return;
		}

		if (!destination) {
			let msg = await message.channel.send(
				":exclamation: Please specify a valid channel."
			);
			setTimeout(() => {
				msg.delete();
			}, 2000);

			return;
		}

		const channel = message.guild.channels.cache.get(destination.id);

		if (!channel || !channel.isText()) return;

		channel.send(toSay).catch(() => {
			message.channel.send(":x: Error sending message.");
		});

		let msg = await message.channel.send(
			`:white_check_mark: Message sent!`
		);
		setTimeout(() => {
			msg.delete();
		}, 2000);
	},
};
