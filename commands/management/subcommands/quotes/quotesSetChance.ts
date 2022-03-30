import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { ownerId } from "../../../../config.json";

export default {
	name: "quotes chance",
	trigger: ["chance"],
	help: {
		description:
			"Set a chance between 1->100 to reply with a quote after the trigger word is detected",
		syntax: "{prefix}quotes `chance` `<number>`",
		example: "{prefix}quotes `chance` `50`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;
		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await database.guilds.findById(message.guildId);

		if (!args[0])
			return message.channel.send(":x: Provide a valid number.");

		const chance = Number(args[0].replace("%", ""));

		if (isNaN(chance))
			return message.channel.send(":x: Invalid number provided.");

		if (!message.guild) return;

		guild.fun.chance = chance;

		await database.guilds.updateOne(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send(`✅ Quotes chance set to ${chance}%`);
	},
};
