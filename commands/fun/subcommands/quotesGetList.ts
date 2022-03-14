import { Message, MessageAttachment } from "discord.js";
import * as database from "../../../database";
import createNewGuild from "../../../database/utils/createNewGuild";
import { parseTextFileAttachment } from "../../../utils/messages/processText";

export async function quotesGetList(message: Message) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;
	if (guild.fun.mode != "custom")
		return message.channel.send("❗ You are using the default list!");

	const text = guild.fun.phrases.join("\n");
	const buffer = Buffer.from(text, "utf-8");
	const attachment = new MessageAttachment(buffer, "List.txt");

	message.channel.send({
		content: "Current word list:",
		files: [attachment],
	});
}
