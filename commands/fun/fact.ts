import { Client, Message, MessageEmbed, CommandInteraction } from "discord.js";
import axios from "axios";
import parseMessagePlaceholderFromString from "../../helpers/text/parseMessagePlaceholderFromString";
import * as database from "./../../database";

export default {
	name: "fact",
	help: {
		description: "Get a random fact!",
		syntax: "{prefix}fact",
		options: `\`today\`: Gets the fact of the day.`,
		example: `{prefix}fact\n {prefix}fact today`,
	},
	interaction: true,
	config: {
		options: [
			{
				name: "type",
				description: "Daily or random?",
				type: 3,
				max_value: 1,
				choices: [
					{
						name: "daily",
						value: "today",
					},
					{
						name: "random",
						value: "random",
					},
				],
			},
		],
	},
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		const guild = await database.guilds.findOne({ _id: command.guildId });

		let type = command.options.get("type")
			? command.options.get("type")?.value
			: "random";

		if (type == "today") {
			axios(`https://uselessfacts.jsph.pl/today.json?language=en`)
				.then(async (res) => {
					const fact = res.data.text;
					const embed = new MessageEmbed({
						title: "🌟 Fact of the Day",
						description: fact.replace(/`/g, "'"),
						color: "#ffac00",
						footer: {
							text: `Feeling lucky? Try \"/fact\" for a random fact!`,
						},
					});
					command.editReply({ embeds: [embed] }).catch(console.error);
				})
				.catch(console.error);
		} else {
			axios
				.get(`https://uselessfacts.jsph.pl/random.json?language=en`)
				.then(async (res) => {
					const fact = res.data.text;
					const embed = new MessageEmbed({
						title: "📘 Random Fact",
						description: fact.replace(/`/g, "'"),
						color: "#0080ff",
						footer: {
							text: `Check out today's fact with \"/fact type:daily\"!`,
						},
					});
					command.editReply({ embeds: [embed] }).catch(console.error);
				})
				.catch(console.error);
		}
	},
};
