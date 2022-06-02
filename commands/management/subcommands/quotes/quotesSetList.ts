import { Message, MessageAttachment } from "discord.js";
import * as database from "../../../../database";
import { parseTextFileAttachment } from "../../../../helpers/text/processText";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "quotes set list",
	trigger: ["setlist"],
	help: {
		description: "Sets a custom list for the server quotes",
		syntax: "{prefix}quotes `set` `list` `[Text File Attachment]`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;
		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await database.guilds.findById(message.guildId);
		const file = message.attachments.first();

		if (!message.guild) return;

		if (!file || file.contentType != "text/plain; charset=utf-8")
			return message.channel.send({
				embeds: [generateErrorEmbed("❗ Please attach a text file.")],
			});

		// ? Prevent big files (It uses bytes)
		if (file.size > 200000)
			return message.channel.send({
				embeds: [generateErrorEmbed("❌ File is too big. Max size is 200KB.")],
			});

		const list = await parseTextFileAttachment(file.url);

		if (list.length < 1)
			return message.channel.send({
				embeds: [generateErrorEmbed("❌ File is empty.")],
			});

		guild.fun.enable = true;
		guild.fun.phrases = list;

		await database.guilds.findOneAndUpdate(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send({
			embeds: [generateSuccessEmbed("✅ Loaded the list!")],
		});
	},
};
