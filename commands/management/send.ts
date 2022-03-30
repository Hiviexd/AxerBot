import { Client, Message } from "discord.js";
import { ownerId } from "../../config.json";
import MissingPermissions from "./../../data/embeds/MissingPermissions";

export default {
	name: "send",
	help: {
		description: "Sends a message to a specified channel",
		syntax: "{prefix}send `<message>` `<channelName>`",
		example: "{prefix}send `i live in your walls` `general`",
	},
	category: "management",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.member || !message.guild) return;

		if (
			!message.member.permissions.has("MANAGE_MESSAGES", true) && message.author.id !== ownerId)
			return message.channel.send({ embeds: [MissingPermissions] });

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
