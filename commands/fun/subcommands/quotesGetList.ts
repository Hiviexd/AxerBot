import { Message, MessageAttachment } from "discord.js";
import * as database from "../../../database";

export const config = {
	name: "viewlist",
	description: "Download custom list",
	syntax: "!quotes `viewlist`",
};

export async function run(message: Message) {
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
