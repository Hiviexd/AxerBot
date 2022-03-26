import { Message, MessageAttachment } from "discord.js";
import * as database from "../../../../database";
import { parseTextFileAttachment } from "../../../../utils/messages/processText";

export const config = {
	name: "set list",
	description: "Sets a custom list for the server quotes",
	syntax: "!quotes `set` `list` `[Text File Attachment]`",
};

export async function run(message: Message) {
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

	guild.quotes.enable = true;
	guild.quotes.phrases = list;

	await database.guilds.findOneAndUpdate(
		{ _id: message.guildId },
		{
			quotes: guild.quotes,
		}
	);

	message.channel.send("✅ Loaded list");
}
