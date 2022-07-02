import axios from "axios";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import calculateFruitsScore from "../../helpers/osu/performance/calculateFruitsScore";
import calculateManiaScore from "../../helpers/osu/performance/calculateManiaScore";
import calculateOsuScore from "../../helpers/osu/performance/calculateOsuScore";
import calculateTaikoScore from "../../helpers/osu/performance/calculateTaikoScore";
import getEmoji from "../../helpers/text/getEmoji";
import { Score } from "../../types/score";
import { User } from "../../types/user";

export default {
	send: async (message: Message, score: Score, user: User) => {
		if (!score || !score.user || !score.beatmapset || !score.beatmap)
			return message.reply({
				content: `**${user.username}** doesn't have any recent score`,
				allowedMentions: {
					repliedUser: false,
				},
			});

		const score_beatmap_file = await axios(
			`https://osu.ppy.sh/osu/${score.beatmap.id}`
		);

		const calculator = {
			osu: calculateOsuScore,
			taiko: calculateTaikoScore,
			fruits: calculateFruitsScore,
			mania: calculateManiaScore,
		};

		const att = calculator[score.beatmap.mode](
			score_beatmap_file.data,
			score
		);

		const mods = score.mods.length > 0 ? ` +${score.mods.join("")}` : "";

		const embed = new MessageEmbed({
			author: {
				iconURL: score.user.avatar_url,
				name: `Recent osu!${
					score.mode != "osu" ? score.mode : ""
				} score from ${score.user.username}`,
			},
			url: `https://osu.ppy.sh/scores/${score.mode}/${score.id}`,
			title: `${score.beatmapset.artist} - ${score.beatmapset.title} [${
				score.beatmap.version
			}] (${att.starRating.toFixed(2)}★${mods})`,
			description: `${getEmoji(score.rank)} • ${
				(score.pp ? score.pp.toFixed(0) : undefined) ||
				Math.round(att.pp)
			}pp › ${(score.accuracy * 100).toFixed(2)}% › <${
				score.max_combo
			}x/${att.maxCombo}x> › \`[${getHitsFor(score)}]\``,
			thumbnail: {
				url: `https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`,
			},
			color: "#f45592",
			timestamp: new Date(score.created_at),
		});

		function getHitsFor(score: Score) {
			if (score.mode == "osu") {
				return `${
					score.statistics.count_300 + score.statistics.count_geki
				}/${score.statistics.count_100 + score.statistics.count_katu}/${
					score.statistics.count_50
				}/${score.statistics.count_miss}`;
			}

			if (score.mode == "taiko") {
				return `${
					score.statistics.count_300 + score.statistics.count_geki
				}/${score.statistics.count_100 + score.statistics.count_katu}/${
					score.statistics.count_miss
				}`;
			}

			if (score.mode == "fruits") {
				return `${
					score.statistics.count_300 + score.statistics.count_geki
				}/${score.statistics.count_100 + score.statistics.count_katu}/${
					score.statistics.count_50
				}/${score.statistics.count_miss}`;
			}

			if (score.mode == "mania") {
				return `${score.statistics.count_300}/${score.statistics.count_geki}/${score.statistics.count_100}/${score.statistics.count_katu}/${score.statistics.count_50}/${score.statistics.count_miss}`;
			}
		}

		message.channel.send({ embeds: [embed] });
	},
	reply: async (command: CommandInteraction, score: Score, user: User) => {
		if (!score || !score.user || !score.beatmapset || !score.beatmap)
			return command.editReply({
				content: `**${user.username}** doesn't have any recent score`,
				allowedMentions: {
					repliedUser: false,
				},
			});

		const score_beatmap_file = await axios(
			`https://osu.ppy.sh/osu/${score.beatmap.id}`
		);

		const calculator = {
			osu: calculateOsuScore,
			taiko: calculateTaikoScore,
			fruits: calculateFruitsScore,
			mania: calculateManiaScore,
		};

		const att = calculator[score.beatmap.mode](
			score_beatmap_file.data,
			score
		);

		const mods = score.mods.length > 0 ? ` +${score.mods.join("")}` : "";

		const embed = new MessageEmbed({
			author: {
				iconURL: score.user.avatar_url,
				name: `Recent osu!${
					score.mode != "osu" ? score.mode : ""
				} score from ${score.user.username}`,
			},
			url: `https://osu.ppy.sh/scores/${score.mode}/${score.id}`,
			title: `${score.beatmapset.artist} - ${score.beatmapset.title} [${
				score.beatmap.version
			}] (${att.starRating.toFixed(2)}★${mods})`,
			description: `${getEmoji(score.rank)} • ${
				(score.pp ? score.pp.toFixed(0) : undefined) ||
				Math.round(att.pp)
			}pp › ${(score.accuracy * 100).toFixed(2)}% › <${
				score.max_combo
			}x/${att.maxCombo}x> › \`[${getHitsFor(score)}]\``,
			thumbnail: {
				url: `https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`,
			},
			color: "#f45592",
			timestamp: new Date(score.created_at),
		});

		function getHitsFor(score: Score) {
			if (score.mode == "osu") {
				return `${
					score.statistics.count_300 + score.statistics.count_geki
				}/${score.statistics.count_100 + score.statistics.count_katu}/${
					score.statistics.count_50
				}/${score.statistics.count_miss}`;
			}

			if (score.mode == "taiko") {
				return `${
					score.statistics.count_300 + score.statistics.count_geki
				}/${score.statistics.count_100 + score.statistics.count_katu}/${
					score.statistics.count_miss
				}`;
			}

			if (score.mode == "fruits") {
				return `${
					score.statistics.count_300 + score.statistics.count_geki
				}/${score.statistics.count_100 + score.statistics.count_katu}/${
					score.statistics.count_50
				}/${score.statistics.count_miss}`;
			}

			if (score.mode == "mania") {
				return `${score.statistics.count_300}/${score.statistics.count_geki}/${score.statistics.count_100}/${score.statistics.count_katu}/${score.statistics.count_50}/${score.statistics.count_miss}`;
			}
		}

		command.editReply({ embeds: [embed] });
	},
};
