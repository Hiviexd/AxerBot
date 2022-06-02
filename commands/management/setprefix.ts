import { Client, Message, MessageEmbed } from "discord.js";
import * as database from "./../../database";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import { ownerId } from "../../config.json";
import generateErrorEmbed from "./../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "setprefix",
	help: {
		description: "Define a custom command prefix on this server.",
		syntax: "{prefix}setprefix `<prefix>`",
		example: "{prefix}setprefix `!`",
	},
	category: "management",
	run: async (bot: Client, message: Message, args: string[]) => {
		let guild = await database.guilds.findOne({ _id: message.guildId });

		if (!message.guild || !message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		guild = await database.guilds.findOne({ _id: message.guildId });

		if (args.length < 1)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❗ Provide a prefix to set.\n\nExample: `!`"
					),
				],
			});

		const new_prefix = args.join("_").trim();

		if (new_prefix.length > 3)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❗ Prefix too long! Max length is 3 characters."
					),
				],
			});

		await database.guilds.findOneAndUpdate(
			{ _id: message.guildId },
			{
				prefix: new_prefix,
			}
		);

		const res = new MessageEmbed()
			.setTitle("✅ Prefix updated!")
			.setDescription(`New prefix on this server is \`${new_prefix}\``)
			.setColor("#1df27d");

		message.channel.send({
			embeds: [res],
		});
	},
};
