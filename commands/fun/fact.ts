import { Client, Message, MessageEmbed } from "discord.js";
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
	category: "fun",
	run: async (bot: Client, message: Message, args: string[]) => {
		const guild = await database.guilds.findOne({ _id: message.guildId });
		if (args.length > 0) {
			if (args[0] == "today") {
				axios
					.get(`https://uselessfacts.jsph.pl/today.json?language=en`)
					.then(async (res) => {
						const fact = res.data.text;
						const embed = new MessageEmbed({
							title: "Fact of the Day",
							description: fact.replace(/`/g, "\'"),
							color: "#ffac00",
							footer: {
								text: parseMessagePlaceholderFromString(
									message,
									guild,
									`Feeling lucky? Try \"{prefix}fact\" for a random fact!`
								),
							},
						});
						message.channel
							.send({ embeds: [embed] })
							.catch(console.error);
					})
					.catch(console.error);
			}
		} else {
			axios
				.get(`https://uselessfacts.jsph.pl/random.json?language=en`)
				.then(async (res) => {
					const fact = res.data.text;
					const embed = new MessageEmbed({
						title: "Random Fact",
						description: fact.replace(/`/g, "\'"),
						color: "#0080ff",
						footer: {
							text: parseMessagePlaceholderFromString(
								message,
								guild,
								`Check out today's fact with \"{prefix}fact today\"!`
							),
						},
					});
					message.channel
						.send({ embeds: [embed] })
						.catch(console.error);
				})
				.catch(console.error);
		}
	},
};
