import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "quotes chance",
	trigger: ["chance"],
	help: {
		description:
			"Set a chance between 1->100 to reply with a quote after the trigger word is detected",
		syntax: "/quotes `chance` `<number>`",
		example: "/quotes `chance` `50`",
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

		if (!args[0])
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❗ Provide a chance between 1->100 to set."
					),
				],
			});

		const chance = Number(args[0].replace("%", ""));

		if (isNaN(chance))
			return message.channel.send({
				embeds: [generateErrorEmbed("❌ Invalid value provided.")],
			});

		if (chance > 100 || chance < 1)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❗ Provide a chance between 1->100 to set."
					),
				],
			});

		if (!message.guild) return;

		guild.fun.chance = chance;

		await database.guilds.updateOne(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send({
			embeds: [
				generateSuccessEmbed(
					`✅ Successfully set the chance to ${chance}%`
				),
			],
		});
	},
};
