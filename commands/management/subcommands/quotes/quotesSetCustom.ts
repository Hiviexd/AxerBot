import { Message } from "discord.js";
import * as database from "../../../../database";

export const config = {
	name: "set custom",
	description: "Change quotes system list to server custom list",
	syntax: "{prefix}quotes `set` `custom`",
	trigger: ["set", "custom"],
};

export async function run(message: Message, args: string[]) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	guild.fun.enable = true;
	guild.fun.mode = "custom";

	await database.guilds.updateOne(
		{ _id: message.guildId },
		{
			fun: guild.fun,
		}
	);

	message.channel.send(`✅ Switched mode to custom`);
}
