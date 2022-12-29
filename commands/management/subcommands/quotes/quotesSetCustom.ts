import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";

export default {
	name: "quotes set custom",
	trigger: ["setcustom"],
	help: {
		description: "Change quotes system list to server custom list",
		syntax: "/quotes `set` `custom`",
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

		guild.fun.enable = true;
		guild.fun.mode = "custom";

		await database.guilds.updateOne(
			{ _id: message.guildId },
			{
				fun: guild.fun,
			}
		);

		message.channel.send({
			embeds: [generateSuccessEmbed("✅ Switched mode to custom.")],
		});
	},
};
