import {
	Client,
	Message,
	MessageCollector,
	MessageEmbed,
	User,
} from "discord.js";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import clearStringDecorators from "../../helpers/text/clearStringDecorators";
import diff from "../../helpers/text/diff";

export default {
	name: "guessbg",
	help: {
		description: "Can you guess which map is?",
		syntax: "{prefix}guessbg",
	},
	category: "fun",
	run: async (bot: Client, message: Message, args: string[]) => {
		const leaderboard: any[] = [];
		const page = Math.floor(Math.random() * (5 - 1) + 1);
		const beatmapsets = await osuApi.fetch.featuredBeatmapsets(page);

		if (beatmapsets.status != 200)
			return message.reply({
				allowedMentions: {
					repliedUser: false,
				},
				content: "Sorry, i can't search for beatmaps rn. Try again?",
			});

		let beatmap = Math.floor(
			Math.random() * (beatmapsets.data.beatmapsets.length - 0) + 0
		);

		function sendLeaderboard() {
			const embed = new MessageEmbed({
				title: "Best players",
				description: "",
				footer: {
					text: "Next map in 5 seconds",
				},
			});

			leaderboard.forEach((u, i) => {
				let newDescription = embed.description || "";

				newDescription += `#${i + 1} **__${u.username}__** • ${
					u.points
				} points
				\n`;

				embed.setDescription(newDescription);
			});

			message.channel.send({ embeds: [embed] });
		}

		function sendNewBeatmap(next: boolean) {
			let timeout = 0;

			if (next) {
				timeout = 5000;
				sendLeaderboard();
			}

			beatmap = Math.floor(
				Math.random() * (beatmapsets.data.beatmapsets.length - 0) + 0
			);

			setTimeout(() => {
				message.channel.send(
					`${beatmapsets.data.beatmapsets[beatmap].artist} - ${beatmapsets.data.beatmapsets[beatmap].title} ${beatmapsets.data.beatmapsets[beatmap].covers["list@2x"]}`
				);

				const collector = new MessageCollector(message.channel, {
					filter: (m) => !m.author.bot,
					max: 100,
					idle: 30000,
					time: 30000,
				});

				collector.on("collect", (m) => {
					console.log(
						diff(
							clearStringDecorators(
								beatmapsets.data.beatmapsets[
									beatmap
								].title.toLowerCase()
							),
							m.content.toLowerCase()
						)
					);
					if (
						diff(
							clearStringDecorators(
								beatmapsets.data.beatmapsets[
									beatmap
								].title.toLowerCase()
							),
							m.content.toLowerCase()
						) <
						Math.round(
							70 /
								beatmapsets.data.beatmapsets[
									beatmap
								].title.toLowerCase().length
						)
					) {
						message.channel.send("Yes!");
						collector.stop();
						updateLeaderboard(m.author);
						sendNewBeatmap(true);
					}
				});
			}, timeout);
		}

		function updateLeaderboard(user: User) {
			if (!leaderboard.find((l) => l.username == user.username)) {
				leaderboard.push({ username: user.username, points: 5 });
			} else {
				const levelIndex = leaderboard.findIndex(
					(l) => l.username == user.username
				);

				leaderboard[levelIndex].points += 5;
			}

			leaderboard.sort((a, b) => b.points - a.points);
		}

		sendNewBeatmap(false);
	},
};
