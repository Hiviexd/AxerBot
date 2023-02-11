import { Client, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import colors from "../../constants/colors";
import axios from "axios";

export default {
	name: "fact",
	help: {
		description: "Get a random fact!",
		syntax: "/fact",
		options: `\`today\`: Gets the fact of the day.`,
		example: `/fact\n /fact today`,
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
	run: async (
		bot: Client,
		command: ChatInputCommandInteraction,
		args: string[]
	) => {
		await command.deferReply();

		let type = command.options.get("type")
			? command.options.get("type")?.value
			: "random";

		if (type == "today") {
			axios(`https://uselessfacts.jsph.pl/today.json?language=en`)
				.then(async (res) => {
					const fact = res.data.text;
					const embed = new EmbedBuilder({
						title: "🌟 Fact of the Day",
						description: fact.replace(/`/g, "'"),
						color: colors.gold,
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
					const embed = new EmbedBuilder({
						title: "📘 Random Fact",
						description: fact.replace(/`/g, "'"),
						color: colors.blue,
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
