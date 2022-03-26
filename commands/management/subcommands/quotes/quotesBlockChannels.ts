import { Message } from "discord.js";
import * as database from "../../../../database";

export const config = {
	name: "block",
	description: "Set channels that quotes can't run.",
	syntax: "!quotes `block` `<#channels>`",
};

export async function run(message: Message, args: string[]) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	args.shift();

	const channels = message.mentions.channels;

	if (channels.size < 1) return;

	const blacklist = guild.fun.blacklist.channels;

	const added_channels: string[] = [];
	channels.forEach((channel) => {
		if (!message.guild?.channels.cache.find((c) => c.id == channel.id))
			return;

		if (!blacklist.includes(channel.id) && channel.type == "GUILD_TEXT") {
			blacklist.push(channel.id);
			added_channels.push(channel.id);
		}
	});

	guild.fun.blacklist.channels = blacklist;

	if (added_channels.length < 1)
		return message.channel.send(
			"Please, provide valid channels. You only can block allowed **TEXT CHANNELS**"
		);

	await database.guilds.findOneAndUpdate({ _id: message.guildId }, guild);

	message.channel.send(
		`✅ Done! Use \`${guild.prefix}quotes status\` to check`
	);
}
