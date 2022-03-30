import { Message, MessageAttachment } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";

export default {
	name: "quotes viewlist",
	trigger: ["viewlist"],
	help: {
		description: "Shows the current custom list",
		syntax: "{prefix}quotes `viewlist`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) && message.author.id !== ownerId)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await database.guilds.findById(message.guildId);

		if (!message.guild) return;
		if (guild.fun.mode != "custom")
			return message.channel.send("❗ You are using the default list!");

		const text = guild.fun.phrases.join("\n");
		const buffer = Buffer.from(text, "utf-8");
		const attachment = new MessageAttachment(buffer, "List.txt");

		message.channel.send({
			content: "Current list:",
			files: [attachment],
		});
	},
};
