import { Message } from "discord.js";
import * as database from "../../../../database";

export const config = {
	name: "set disabled",
	description: "Disables the quotes system",
	syntax: "{prefix}quotes `set` `disabled`",
	trigger: ["set", "disabled"],
};

export async function run(message: Message, args: string[]) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	guild.fun.enable = false;

	await database.guilds.updateOne(
		{ _id: message.guildId },
		{
			fun: guild.fun,
		}
	);

	message.channel.send("✅ System disabled");
}
