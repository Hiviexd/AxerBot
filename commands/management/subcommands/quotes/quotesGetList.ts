import { Message, MessageAttachment } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "quotes viewlist",
	trigger: ["viewlist"],
	help: {
		description: "Shows the current custom list",
		syntax: "/quotes `viewlist`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await database.guilds.findById(message.guildId);
		if (!guild) return;

		if (!message.guild) return;
		if (guild.fun.mode != "custom")
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❗ This server is not using a custom quote list."
					),
				],
			});

		const text = guild.fun.phrases.join("\n");
		const buffer = Buffer.from(text, "utf-8");
		const attachment = new MessageAttachment(buffer, "List.txt");

		message.channel.send({
			content: "Current list:",
			files: [attachment],
		});
	},
};
