import { Message, MessageAttachment } from "discord.js";
import * as database from "../../../../database";

export const config = {
	name: "viewlist",
	description: "Shows the current custom list",
	syntax: "{prefix}quotes `viewlist`",
	trigger: ["viewlist"],
};

export async function run(message: Message, args: string[]) {
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
}
