import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";

export const config = {
	name: "status",
	description: "Check quotes system configuration",
	syntax: "{prefix}quotes `status`",
	trigger: ["status"],
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

	if (!guild.fun.word) guild.fun.word = "axer";

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
					{
						name: "Blocked channels",
						value:
							guild.fun.blacklist.channels.length > 0
								? `${guild.fun.blacklist.channels.map(
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
