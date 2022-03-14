import { Message } from "discord.js";
import * as database from "./../../../database";
import createNewGuild from "../../../database/utils/createNewGuild";

export async function quotesGetStatus(message: Message) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	if (!guild) guild = await createNewGuild(message.guild);

	message.channel.send({
		embeds: [
			{
				title: "Current quotes system configuration",
				color: guild.fun.enable ? "#1df27d" : "#e5243b",
				fields: [
					{
						name: "Status",
						value: guild.fun.enable ? "`Enabled`" : "`Disabled`",
					},
					{
						name: "List mode",
						value: `\`${guild.fun.mode
							.charAt(0)
							.toUpperCase()
							.concat(guild.fun.mode.slice(1))}\``, // Captalize the first character
					},
					{
						name: "Trigger word",
						value: `\`${guild.fun.word.toLowerCase()}\``,
					},
				],
			},
		],
	});
}
