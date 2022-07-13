import { Client, CommandInteraction, Message } from "discord.js";
import { ownerId } from "../../config.json";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "send",
	help: {
		description: "Sends a message to a specified channel",
		syntax: "{prefix}send `<message>` `<channelName>`",
		example: "{prefix}send `i live in your walls` `general`",
	},
	config: {
		type: 1,
		options: [
			{
				name: "channel",
				type: 7,
				description: "Text channel to send the message",
				required: true,
			},
			{
				name: "message",
				type: 3,
				description: "Message to send",
				required: true,
			},
		],
	},
	interaction: true,
	category: "management",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		if (!command.member || !command.guild) return;

		if (typeof command.member?.permissions == "string") return;

		if (
			!command.member.permissions.has("MANAGE_MESSAGES", true) &&
			command.user.id !== ownerId
		)
			return command.editReply({ embeds: [MissingPermissions] });

		const channel = command.options.getChannel("channel", true);
		const message = command.options.getString("message", true);

		if (!command.channel || !command.channel.isText()) return;

		const guild_channel = await command.guild.channels.fetch(channel.id);

		if (!guild_channel)
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"❗ Please specify the message you want to send."
					),
				],
			});

		if (guild_channel.isText()) {
			guild_channel.send(message).then(() => {
				command.editReply({
					embeds: [generateSuccessEmbed("✅ Message sent!")],
				});
			});
		}

		// if (!message.member || !message.guild) return;

		// if (
		// 	!message.member.permissions.has("MANAGE_MESSAGES", true) && message.author.id !== ownerId)
		// 	return message.channel.send({ embeds: [MissingPermissions] });

		// let lastArg = args[args.length - 1];
		// args.pop();
		// let toSay = args.join(" ");
		// let destination = message.guild.channels.cache.find(
		// 	(channel) => channel.name === lastArg
		// );

		// if (!toSay) {
		// 	let msg = await message.channel.send({
		// 		embeds: [
		// 			generateErrorEmbed(
		// 				"❗ Please specify the message you want to send."
		// 			),
		// 		],
		// 	});
		// 	return;
		// }

		// if (!destination) {
		// 	let msg = await message.channel.send({
		// 		embeds: [
		// 			generateErrorEmbed(
		// 				"❗ Please specify a valid channel."
		// 			),
		// 		],
		// 	});
		// 	return;
		// }

		// const channel = message.guild.channels.cache.get(destination.id);

		// if (!channel || !channel.isText()) return;

		// channel.send(toSay).catch(() => {
		// 	message.channel.send({
		// 		embeds: [
		// 			generateErrorEmbed(
		// 				"❌ Error sending message."
		// 			),
		// 		],
		// 	});
		// });

		// let msg = await message.channel.send({
		// 	embeds: [
		// 		generateSuccessEmbed(
		// 			"✅ Message sent!"
		// 		),
		// 	],
		// });
	},
};
