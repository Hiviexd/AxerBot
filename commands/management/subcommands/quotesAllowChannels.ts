import { Message } from "discord.js";
import * as database from "../../../database";

export const config = {
	name: "allow",
	description: "Remove a channel from blacklist.",
	syntax: "!quotes `allow` `<#channels>`",
};

export async function run(message: Message, args: string[]) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	args.shift();

	const channels = message.mentions.channels;

	if (channels.size < 1) return;

	let blacklist = guild.quotes.blacklist.channels;

	const added_channels: string[] = [];
	channels.forEach((channel) => {
		if (!message.guild?.channels.cache.find((c) => c.id == channel.id))
			return;

		if (blacklist.includes(channel.id) && channel.type == "GUILD_TEXT") {
			blacklist = blacklist.filter((c: any) => c != channel.id);
			added_channels.push(channel.id);
		}
	});

	guild.quotes.blacklist.channels = blacklist;

	if (added_channels.length < 1)
		return message.channel.send("Provide valid channels mf");

	await database.guilds.findOneAndUpdate({ _id: message.guildId }, guild);

	message.channel.send("I fucked ur mom");
}
