import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "quotes set word",
	trigger: ["setword"],
	help: {
		description: "Sets a trigger word for the quotes system",
		syntax: "/quotes `set` `word` `<new word>`",
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
			return message.channel.send({
				embeds: [generateErrorEmbed("❗ Please specify a word.")],
			});

		let guild = await database.guilds.findById(message.guildId);
		if (!guild) return;

		if (!message.guild) return;

		guild.fun.enable = true;
		guild.fun.word = word.toUpperCase();

		await database.guilds.updateOne(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send({
			embeds: [
				generateSuccessEmbed(`✅ Trigger word set to \`${word}\`!`),
			],
		});
	},
};
