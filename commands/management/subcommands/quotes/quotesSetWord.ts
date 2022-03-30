import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";

export default {
	name: "quotes set word",
	trigger: ["setword"],
	help: {
		description: "Sets a trigger word for the quotes system",
		syntax: "{prefix}quotes `set` `word` `<new word>`",
	},
	run: async (message: Message, args: string[]) => {
		const word = args.join(" ").trim();

		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		if (word == "")
			return message.channel.send(":x: Provide a valid trigger word.");

		let guild = await database.guilds.findById(message.guildId);

		if (!message.guild) return;

		guild.fun.enable = true;
		guild.fun.word = word.toUpperCase();

		await database.guilds.updateOne(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send(`✅ Trigger word changed to \`${word}\``);
	},
};
