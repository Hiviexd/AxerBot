import { Client, Message, MessageEmbed } from "discord.js";
import createNewGuild from "../../database/utils/createNewGuild";
import * as database from "./../../database";

export default {
	name: "setprefix",
	description: "Define a custom command prefix on this server.",
	example: "!setprefix `-`",
	syntax: "!setprefix `new_prefix`",
	category: "moderation",
	run: async (bot: Client, message: Message, args: string[]) => {
		let guild = await database.guilds.findOne({ _id: message.guildId });

		if (!message.guild || !message.member) return;

		if (!message.member.permissions.has("ADMINISTRATOR"))
			return message.channel.send("Invalid permissions.");

		if (guild == null) await createNewGuild(message.guild);

		guild = await database.guilds.findOne({ _id: message.guildId });

		if (args.length < 1)
			return message.channel.send("Provide a valid prefix!");

		const new_prefix = args.join("_").trim();

		if (new_prefix.length > 3)
			return message.channel.send(
				"Prefix too big! The max length is 3 characters."
			);

		await database.guilds.findOneAndUpdate(
			{ _id: message.guildId },
			{
				prefix: new_prefix,
			}
		);

		const res = new MessageEmbed()
			.setTitle("✅ Configuration updated!")
			.setDescription(`Now, my prefix here is \`${new_prefix}\``)
			.setColor("#1df27d");

		message.channel.send({
			embeds: [res],
		});
	},
};
