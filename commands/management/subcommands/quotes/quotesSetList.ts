import { Message, MessageAttachment } from "discord.js";
import * as database from "../../../../database";
import { parseTextFileAttachment } from "../../../../helpers/text/processText";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";

export const config = {
	name: "set list",
	description: "Sets a custom list for the server quotes",
	syntax: "{prefix}quotes `set` `list` `[Text File Attachment]`",
	trigger: ["set", "list"],
};

export async function run(message: Message, args: string[]) {
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
		return message.channel.send(":x: Provide a valid text file. (.txt)");

	// ? Prevent big files (It uses bytes)
	if (file.size > 200000)
		return message.channel.send(":x: File too big. (Max 200kb)");

	const list = await parseTextFileAttachment(file.url);

	if (list.length < 1) return message.channel.send(":x: Invalid list size");

	guild.fun.enable = true;
	guild.fun.phrases = list;

	await database.guilds.findOneAndUpdate(
		{ _id: message.guildId },
		{
			fun: guild.fun,
		}
	);

	message.channel.send("✅ Loaded list");
}
