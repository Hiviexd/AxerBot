import { Message } from "discord.js";
import * as database from "./../../../database";
import createNewGuild from "../../../database/utils/createNewGuild";

export const config = {
	name: "set disabled",
	description: "Disables the quotes system",
	syntax: "!quotes `set` `disabled`",
};

export async function run(message: Message, state: boolean) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	if (!guild) guild = await createNewGuild(message.guild);

	guild.fun.enable = state;

	await database.guilds.updateOne(
		{ _id: message.guildId },
		{
			fun: guild.fun,
		}
	);

	message.channel.send(
		"✅ Switched state to enabled: ".concat(state.toString())
	);
}
