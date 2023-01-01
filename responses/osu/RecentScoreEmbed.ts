import axios from "axios";
import {
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from "discord.js";
import { calculateScore } from "../../helpers/osu/performance/calculateScore";
import getEmoji from "../../helpers/text/getEmoji";
import { Score } from "../../types/score";
import { User } from "../../types/user";
import colors from "../../constants/colors";
import {
	calculateBeatmap,
	generateRulesetBeatmap,
} from "../../helpers/osu/performance/calculateBeatmap";
import abbreviation from "./../../helpers/text/abbreviation";
import { GameMode } from "./../../types/game_mode";
import { generateHitStatistics } from "../../helpers/osu/performance/generateHitStatistics";

export default {
	send: async (command: CommandInteraction, score: Score, user: User) => {
		if (!score.beatmap || !score.user || !score.beatmapset) return;

		const score_beatmap_file = await axios(
			`https://osu.ppy.sh/osu/${score.beatmap.id}`
		);

		const rulesetBeatmap = generateRulesetBeatmap(
			score_beatmap_file.data,
			score.mode_int,
			score.mods.join("")
		);

		const realPerformance = calculateScore(
			score_beatmap_file.data,
			score.mode_int,
			score
		);

		function getMods(mods: string[]) {
			if (mods.length < 1) return "";

			return ` +${mods.join("")}`;
		}

		const embed = new MessageEmbed()
			.setAuthor({
				name: `Most recent ${abbreviation(
					score.user.username
				)} ${getRulesetName(score.mode)} score`,
				iconURL: `https://a.ppy.sh/${score.user.id}`,
				url: `https://osu.ppy.sh/scores/${score.mode}/${score.id}`,
			})
			.setTitle(
				`${score.beatmapset.artist} - ${score.beatmapset.title} [${
					score.beatmap.version
				}] (★${realPerformance.starRating.toFixed(2)}${getMods(
					score.mods
				)})`
			)
			.setThumbnail(`https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`)
			.setURL(score.beatmap.url)
			.setDescription(
				`▸ ${getEmoji(score.rank)} ${(score.accuracy * 100).toFixed(
					2
				)}% [${score.max_combo}x/${rulesetBeatmap.maxCombo}x] ▸ **${
					Math.round(score.pp) || realPerformance.pp
				}pp** ${generatePerformanceStatistics()}\n▸ ${score.score.toLocaleString(
					"en-US"
				)} ▸ ${generateHitField()} ▸ <t:${Math.trunc(
					new Date(score.created_at).getTime() / 1000
				)}:R>`
			)
			.setColor(colors.pink);

		function generateHitField() {
			if (score.mode_int == GameMode.osu)
				return `[${
					score.statistics.count_300 + score.statistics.count_katu
				}/${score.statistics.count_100 + score.statistics.count_geki}/${
					score.statistics.count_50
				}/${score.statistics.count_miss}]`;

			if (score.mode_int == GameMode.taiko)
				return `[${
					score.statistics.count_300 + score.statistics.count_katu
				}/${score.statistics.count_100 + score.statistics.count_geki}/${
					score.statistics.count_miss
				}]`;

			if (score.mode_int == GameMode.fruits) {
				const hitStatistics = generateHitStatistics({
					beatmap: rulesetBeatmap,
					accuracy: score.accuracy,
				});

				return `[${hitStatistics.great}/${hitStatistics.largeTickHit}/${hitStatistics.smallTickHit}/${hitStatistics.miss}]`;
			}

			if (score.mode_int == GameMode.mania) {
				const hitStatistics = generateHitStatistics({
					beatmap: rulesetBeatmap,
					accuracy: score.accuracy,
				});

				return `[${hitStatistics.perfect}/${hitStatistics.great}/${hitStatistics.good}/${hitStatistics.ok}${hitStatistics.meh}/${hitStatistics.miss}]`;
			}
		}

		function generatePerformanceStatistics() {
			const calculatedBeatmap = calculateBeatmap(
				score_beatmap_file.data,
				score.mode_int,
				score.mods.join("")
			);

			if (Math.round(score.accuracy * 100) >= 100) return "";

			if (score.max_combo == rulesetBeatmap.maxCombo)
				return `(${calculatedBeatmap.performance[0].pp}pp for 100% FC)`;

			return `(${realPerformance.fc}pp for ${(
				realPerformance.fcAcc * 100
			).toFixed(2)}% FC)`;
		}

		function getRulesetName(ruleset: string) {
			const names: { [key: string]: string } = {
				osu: "osu!",
				taiko: "osu!taiko",
				fruits: "osu!catch",
				mania: "osu!mania",
			};

			return names[ruleset];
		}

		const openBeatmapButton = new MessageButton()
			.setLabel("Beatmap Page")
			.setStyle(5)
			.setURL(score.beatmap.url);

		const userProfileButton = new MessageButton()
			.setLabel("Player Profile")
			.setStyle(5)
			.setURL(`https://osu.ppy.sh/u/${score.user.id}`);

		const buttonsActionRow = new MessageActionRow().addComponents(
			openBeatmapButton,
			userProfileButton
		);

		return command.editReply({
			embeds: [embed],
			components: [buttonsActionRow],
		});

		// 	if (!score || !score.user || !score.beatmapset || !score.beatmap)
		// 		return message.reply({
		// 			content: `**${user.username}** doesn't have any recent score`,
		// 			allowedMentions: {
		// 				repliedUser: false,
		// 			},
		// 		});
		// 	const score_beatmap_file = await axios(
		// 		`https://osu.ppy.sh/osu/${score.beatmap.id}`
		// 	);
		// 	const calculator = {
		// 		osu: calculateOsuScore,
		// 		taiko: calculateTaikoScore,
		// 		fruits: calculateFruitsScore,
		// 		mania: calculateManiaScore,
		// 	};
		// 	const att = calculator[score.beatmap.mode](
		// 		score_beatmap_file.data,
		// 		score
		// 	);
		// 	const mods = score.mods.length > 0 ? ` +${score.mods.join("")}` : "";
		// 	const embed = new MessageEmbed({
		// 		author: {
		// 			iconURL: score.user.avatar_url,
		// 			name: `Recent osu!${
		// 				score.mode != "osu" ? score.mode : ""
		// 			} score from ${score.user.username}`,
		// 		},
		// 		url: `https://osu.ppy.sh/scores/${score.mode}/${score.id}`,
		// 		title: `${score.beatmapset.artist} - ${score.beatmapset.title} [${
		// 			score.beatmap.version
		// 		}] (${att.starRating.toFixed(2)}★${mods})`,
		// 		description: `${getEmoji(score.rank)} • ${
		// 			(score.pp ? score.pp.toFixed(0) : undefined) ||
		// 			Math.round(att.pp)
		// 		}pp › ${(score.accuracy * 100).toFixed(2)}% › <${
		// 			score.max_combo
		// 		}x/${att.maxCombo}x> › \`[${getHitsFor(score)}]\``,
		// 		thumbnail: {
		// 			url: `https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`,
		// 		},
		// 		color: colors.pink,
		// 		timestamp: new Date(score.created_at),
		// 	});
		// 	function getHitsFor(score: Score) {
		// 		if (score.mode == "osu") {
		// 			return `${
		// 				score.statistics.count_300 + score.statistics.count_geki
		// 			}/${score.statistics.count_100 + score.statistics.count_katu}/${
		// 				score.statistics.count_50
		// 			}/${score.statistics.count_miss}`;
		// 		}
		// 		if (score.mode == "taiko") {
		// 			return `${
		// 				score.statistics.count_300 + score.statistics.count_geki
		// 			}/${score.statistics.count_100 + score.statistics.count_katu}/${
		// 				score.statistics.count_miss
		// 			}`;
		// 		}
		// 		if (score.mode == "fruits") {
		// 			return `${
		// 				score.statistics.count_300 + score.statistics.count_geki
		// 			}/${score.statistics.count_100 + score.statistics.count_katu}/${
		// 				score.statistics.count_50
		// 			}/${score.statistics.count_miss}`;
		// 		}
		// 		if (score.mode == "mania") {
		// 			return `${score.statistics.count_300}/${score.statistics.count_geki}/${score.statistics.count_100}/${score.statistics.count_katu}/${score.statistics.count_50}/${score.statistics.count_miss}`;
		// 		}
		// 	}
		// 	message.channel.send({ embeds: [embed] });
		// },
		// reply: async (command: CommandInteraction, score: Score, user: User) => {
		// 	if (!score || !score.user || !score.beatmapset || !score.beatmap)
		// 		return command.editReply({
		// 			content: `**${user.username}** doesn't have any recent score`,
		// 			allowedMentions: {
		// 				repliedUser: false,
		// 			},
		// 		});
		// 	const score_beatmap_file = await axios(
		// 		`https://osu.ppy.sh/osu/${score.beatmap.id}`
		// 	);
		// 	const calculator = {
		// 		osu: calculateOsuScore,
		// 		taiko: calculateTaikoScore,
		// 		fruits: calculateFruitsScore,
		// 		mania: calculateManiaScore,
		// 	};
		// 	const att = calculator[score.beatmap.mode](
		// 		score_beatmap_file.data,
		// 		score
		// 	);
		// 	const mods = score.mods.length > 0 ? ` +${score.mods.join("")}` : "";
		// 	const embed = new MessageEmbed({
		// 		author: {
		// 			iconURL: score.user.avatar_url,
		// 			name: `Recent osu!${
		// 				score.mode != "osu" ? score.mode : ""
		// 			} score from ${score.user.username}`,
		// 		},
		// 		url: `https://osu.ppy.sh/scores/${score.mode}/${score.id}`,
		// 		title: `${score.beatmapset.artist} - ${score.beatmapset.title} [${
		// 			score.beatmap.version
		// 		}] (${att.starRating.toFixed(2)}★${mods})`,
		// 		description: `${getEmoji(score.rank)} • ${
		// 			(score.pp ? score.pp.toFixed(0) : undefined) ||
		// 			Math.round(att.pp)
		// 		}pp › ${(score.accuracy * 100).toFixed(2)}% › <${
		// 			score.max_combo
		// 		}x/${att.maxCombo}x> › \`[${getHitsFor(score)}]\``,
		// 		thumbnail: {
		// 			url: `https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`,
		// 		},
		// 		color: colors.pink,
		// 		timestamp: new Date(score.created_at),
		// 	});
		// 	function getHitsFor(score: Score) {
		// 		const geki = score.statistics.count_geki;
		// 		const katu = score.statistics.count_katu;
		// 		const n300 = score.statistics.count_300;
		// 		const n100 = score.statistics.count_100;
		// 		const n50 = score.statistics.count_50;
		// 		const miss = score.statistics.count_miss;
		// 		if (score.mode == "osu") {
		// 			return [n300, n100, n50, miss].join("/");
		// 		}
		// 		if (score.mode == "taiko") {
		// 			return [n300, n100, miss].join("/");
		// 		}
		// 		if (score.mode == "fruits") {
		// 			return [n300, n100, n50, katu, miss].join("/");
		// 		}
		// 		if (score.mode == "mania") {
		// 			return [geki, n300, katu, n100, n50, miss].join("/");
		// 		}
		// 	}
		// 	command.editReply({ embeds: [embed] });
	},
};
