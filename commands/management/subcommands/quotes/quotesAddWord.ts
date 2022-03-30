import { Message } from "discord.js";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import * as database from "../../../../database";

export default {
	name: "quotes add",
	trigger: ["add"],
	help: {
		description: "Adds a new phrase to the server custom quotes list",
		syntax: "{prefix}quotes `add` `<phrase>`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) && message.author.id !== ownerId)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await database.guilds.findById(message.guildId);

		if (guild.fun.mode != "custom")
			return message.channel.send(
				":x: Switch to custom list mode to add a new phrase."
			);

		// ? Prevent add blank spaces
		if (args.length < 1 || args.join(" ").trim() == "")
			return message.channel.send(
				":x: what am i supposed to add??? dumbass??"
			);

		if (!message.guild) return;

		guild.fun.phrases.push(args.join(" "));

		await database.guilds.updateOne(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send(`✅ Phrase added!`);
	},
};
