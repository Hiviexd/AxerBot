import { Message } from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

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
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await database.guilds.findById(message.guildId);

		if (!guild) return;

		if (guild.fun.mode != "custom")
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❗ This server is not in custom quotes mode."
					),
				],
			});

		// ? Prevent add blank spaces
		if (args.length < 1 || args.join(" ").trim() == "")
			return message.channel.send({
				embeds: [generateErrorEmbed("❗ Provide a phrase to add.")],
			});

		if (!message.guild) return;

		guild.fun.phrases.push(args.join(" "));

		await database.guilds.updateOne(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send({
			embeds: [generateSuccessEmbed(`✅ Phrase added!`)],
		});
	},
};
