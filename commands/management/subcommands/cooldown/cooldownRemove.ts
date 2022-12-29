import { Message, ReactionCollector } from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import * as database from "../../../../database";
import CommandOptionInvalid from "../../../../responses/embeds/CommandOptionInvalid";
import { ownerId } from "../../../../config.json";
import generateConfirmationEmbed from "./../../../../helpers/text/embeds/generateConfirmationEmbed";
import generateErrorEmbed from "./../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "cooldown remove",
	trigger: ["remove"],
	help: {
		description: "Remove a channel from a category.",
		syntax: "/cooldown `remove` `<channel>` `<category>`",
	},
	run: async (message: Message, args: string[]) => {
		let guild = await database.guilds.findOne({ _id: message.guildId });
		const categories = ["contests", "fun", "misc", "management", "osu"];

		if (!guild) return;

		async function updateDB() {
			if (!guild) return;

			await database.guilds.findOneAndUpdate({ _id: guild._id }, guild);
		}

		if (
			!message.member?.permissions.has("ADMINISTRATOR") &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		if (!args[0] || !args[1])
			return message.channel.send({ embeds: [CommandOptionInvalid] });

		const channel = message.guild?.channels.cache.find(
			(c) =>
				c.name.toLowerCase() == args[0].toLowerCase() &&
				c.type == "GUILD_TEXT"
		);

		const category = args[1].toLowerCase();

		if (!channel)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						`❗ Channel \`${args[0].toLowerCase()}\` not found.`
					),
				],
			});

		if (!categories.includes(category))
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						`❗ Category \`${category}\` not found.`
					),
				],
			});

		if (
			guild.cooldown[category].channels.includes(
				channel.name.toLowerCase()
			)
		)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						`❗ The category \`${category}\` does not have any channel called \`${channel.name}\`!`
					),
				],
			});

		if (guild.cooldown[category].channels.length < 2)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						`❗ The category \`${category}\` has only 1 channel configured, use \`${guild.prefix}cooldown clear ${category}\` instead!`
					),
				],
			});

		// ? Remove channel from "Channels" array
		const index = guild.cooldown[category].channels.findIndex(
			(c: any) => c == channel.id
		);
		guild.cooldown[category].channels.splice(index, 1);

		// ? Remove channel from "ends_at" object
		delete guild.cooldown[category].ends_at[channel.id];

		// ? Remove channel from "current_increments" object
		delete guild.cooldown[category].current_increments[channel.id];

		generateConfirmationEmbed(message, updateDB);
	},
};
