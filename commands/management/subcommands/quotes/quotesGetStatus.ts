import { Message } from "discord.js";
import * as database from "../../../../database";

export const config = {
	name: "status",
	description: "Check quotes system configuration",
	syntax: "!quotes `status`",
};

export async function run(message: Message) {
	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	if (!guild.quotes.word) guild.quotes.word = "axer";

	message.channel.send({
		embeds: [
			{
				title: "Current quotes system configuration",
				color: guild.quotes.enable ? "#1df27d" : "#e5243b",
				fields: [
					{
						name: "Status",
						value: guild.quotes.enable ? "`Enabled`" : "`Disabled`",
					},
					{
						name: "List mode",
						value: `\`${guild.quotes.mode
							.charAt(0)
							.toUpperCase()
							.concat(guild.quotes.mode.slice(1))}\``, // Captalize the first character
					},
					{
						name: "Trigger word",
						value: `\`${guild.quotes.word.toLowerCase()}\``,
					},
					{
						name: "Blocked channels",
						value:
							guild.quotes.blacklist.channels.length > 0
								? `${guild.quotes.blacklist.channels.map(
										(c: any) => {
											return `<#${c}>`;
										}
								  )}`
								: "@hivie can be a nice block",
					},
				],
			},
		],
	});
}
