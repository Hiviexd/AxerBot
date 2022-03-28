import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";

export const config = {
	name: "set custom",
	description: "Change quotes system list to server custom list",
	syntax: "{prefix}quotes `set` `custom`",
	trigger: ["set", "custom"],
};

export async function run(message: Message, args: string[]) {
	if (!message.member) return;

	if (
		!message.member.permissions.has("MANAGE_GUILD", true) &&
		message.author.id !== ownerId
	)
		return message.channel.send({ embeds: [MissingPermissions] });

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
