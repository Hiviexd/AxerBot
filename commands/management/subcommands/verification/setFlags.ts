import { Message } from "discord.js";
import CommandOptionInvalid from "../../../../data/embeds/CommandOptionInvalid";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "./../../../../config.json";

export default {
	name: "verification flags",
	trigger: ["flags"],
	help: {
		description:
			"Set which data that will be replaced with the osu! user data.",
		syntax: "{prefix}verification `flags` `<flag>,<value>`",
		example: "{prefix}verification `flags` `username,true`",
		"avaliable flags": [
			"`username,<true|false>`: Set the user's discord nickname to match their osu! username",
		],
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		if (args.length < 1)
			return message.channel.send({ embeds: [CommandOptionInvalid] });

		let guild = await guilds.findById(message.guildId);

		const validFlags = ["username"];

		const flagsValues: any = {
			username: "boolean",
		};
		const flagsToUpdate: { target: string; value: any }[] = [];

		args.forEach((a) => {
			const flag = a.split(",");

			if (flag.length != 2) return;

			if (validFlags.includes(flag[0].toLowerCase())) {
				flagsToUpdate.push({
					target: flag[0].toLowerCase(),
					value: flag[1].toLowerCase(),
				});
			}
		});

		const clearFlags: any[] = [];

		flagsToUpdate.forEach((flag) => {
			switch (flagsValues[flag.target]) {
				case "boolean": {
					const booleans = ["true", "false"];
					if (!booleans.includes(flag.value)) return;

					clearFlags.push({
						target: flag.target,
						value: Boolean(flag.value),
					});

					break;
				}
			}
		});

		clearFlags.forEach((flag) => {
			guild.verification.targets[flag.target] = flag.value;
		});

		if (clearFlags.length < 1)
			return message.reply(
				`:x: Invalid tags! Check if you are using the correct syntax using \`${guild.prefix}help verification fags\``
			);

		await guilds.findByIdAndUpdate(message.guildId, guild);

		message.channel.send(`✅ Done! Flags updated.`);
	},
};
