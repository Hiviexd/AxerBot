import { Message } from "discord.js";
import * as database from "./../../../database";
import createNewGuild from "../../../database/utils/createNewGuild";

export async function quotesSetMode(message: Message, mode:string) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	if (!guild) guild = await createNewGuild(message.guild);

	guild.fun.enable = true;
	guild.fun.mode = mode;

	await database.guilds.updateOne(
		{ _id: message.guildId },
		{
			fun: guild.fun,
		}
); 

	message.channel.send(`✅ Switched mode to \`${mode}\``);
}