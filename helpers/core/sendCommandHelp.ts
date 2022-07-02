import { Message, MessageEmbed } from "discord.js";
import parseMessagePlaceholderFromString from "../text/parseMessagePlaceholderFromString";
import * as database from "./../../database";

export default async (command: any, message: Message) => {
	const guild = await database.guilds.findOne({ _id: message.guildId });

	if (!guild) return;

	const embed = new MessageEmbed({
		title: `${guild.prefix}${command.name}`,
		description: parseMessagePlaceholderFromString(
			message,
			guild,
			command.help.description || "No description provided"
		),
		color: "#f45592",
		fields: [],
	});

	const invalidFields = ["name", "description"];
	Object.keys(command.help).map(async (option) => {
		if (invalidFields.includes(option)) return;

		if (typeof command.help[option] == "string") {
			let field_content;

			field_content = parseMessagePlaceholderFromString(
				message,
				guild,
				command.help[option]
			);

			return embed.addField(option, field_content);
		}

		if (typeof command.help[option] == "object") {
			let field_content = parseMessagePlaceholderFromString(
				message,
				guild,
				command.help[option].join("\n")
			);

			return embed.addField(option, field_content);
		}
	});

	message.channel.send({
		embeds: [embed],
	});
};
