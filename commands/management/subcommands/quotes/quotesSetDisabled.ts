import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";

export default {
	name: "quotes set disabled",
	trigger: ["setdisabled"],
	help: {
		description: "Disables the quotes system",
		syntax: "/quotes `set` `disabled`",
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

		if (!message.guild) return;

		guild.fun.enable = false;

		await database.guilds.updateOne(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send({
			embeds: [generateSuccessEmbed("✅ Disabled quotes system.")],
		});
	},
};
