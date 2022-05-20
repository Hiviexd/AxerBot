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
			"Set which data that will be replaced to the osu! user data.",
		syntax: "{prefix}verification `flags` `username`",
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
			username: "booelan",
		};
		const flagsToUpdate: { target: string; value: any }[] = [];

		args.forEach((a) => {
			const flag = a.split(",");

			if (validFlags.includes(flag[0].toLowerCase())) {
				flagsToUpdate.push();
			}
		});

		flagsToUpdate.forEach((flag) => {
			if (typeof flag.value != flagsValues[flag.target] && flag.value) {
				guild.verification.targets[flag.target] = flag.value;
			}
		});

		await guilds.findByIdAndUpdate(message.guildId, guild);

		message.channel.send(`✅ Done! Flags updated.`);
	},
};
