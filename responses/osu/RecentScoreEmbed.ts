import axios from "axios";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from "discord.js";
import colors from "../../constants/colors";
import getEmoji from "../../helpers/text/getEmoji";
import {
    calculateBeatmap,
    generateRulesetBeatmap,
} from "../../modules/osu/performance/calculateBeatmap";
import { calculateScore } from "../../modules/osu/performance/calculateScore";
import { generateHitStatistics } from "../../modules/osu/performance/generateHitStatistics";
import { Score } from "../../types/score";
import { User } from "../../types/user";
import abbreviation from "./../../helpers/text/abbreviation";
import { GameMode } from "./../../types/game_mode";

export default {
    send: async (command: ChatInputCommandInteraction, score: Score, user: User) => {
        if (!score.beatmap || !score.user || !score.beatmapset) return;

        const score_beatmap_file = await axios(`https://osu.ppy.sh/osu/${score.beatmap.id}`);

        const rulesetBeatmap = generateRulesetBeatmap(
            score_beatmap_file.data,
            score.mode_int,
            score.mods.join("")
        );

        const realPerformance = calculateScore(score_beatmap_file.data, score.mode_int, score);

        function getMods(mods: string[]) {
            if (mods.length < 1) return "";

            return ` +${mods.join("")}`;
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Most recent ${abbreviation(score.user.username)} ${getRulesetName(
                    score.mode
                )} score`,
                iconURL: `https://a.ppy.sh/${score.user.id}`,
                url: `https://osu.ppy.sh/scores/${score.mode}/${score.id}`,
            })
            .setTitle(
                `${score.beatmapset.artist} - ${score.beatmapset.title} [${
                    score.beatmap.version
                }] (★${realPerformance.starRating.toFixed(2)}${getMods(score.mods)})`
            )
            .setThumbnail(`https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`)
            .setURL(score.beatmap.url)
            .setDescription(
                `▸ ${getEmoji(score.rank as keyof typeof getEmoji)} ${(
                    score.accuracy * 100
                ).toFixed(2)}% [${score.max_combo}x/${rulesetBeatmap.maxCombo}x] ▸ **${
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
                return `[${score.statistics.count_300}/${score.statistics.count_100}/${score.statistics.count_50}/${score.statistics.count_miss}]`;

            if (score.mode_int == GameMode.taiko)
                return `[${score.statistics.count_300 + score.statistics.count_katu}/${
                    score.statistics.count_100 + score.statistics.count_geki
                }/${score.statistics.count_miss}]`;

            if (score.mode_int == GameMode.fruits) {
                const hitStatistics = generateHitStatistics({
                    beatmap: rulesetBeatmap,
                    accuracy: score.accuracy,
                });

                return `[${hitStatistics.count300}/${hitStatistics.count100}/${hitStatistics.count50}/${hitStatistics.countMiss}]`;
            }

            if (score.mode_int == GameMode.mania) {
                const hitStatistics = generateHitStatistics({
                    beatmap: rulesetBeatmap,
                    accuracy: score.accuracy,
                });

                return `[${hitStatistics.countGeki}/${hitStatistics.count300}/${hitStatistics.countKatu}/${hitStatistics.count100}${hitStatistics.count50}/${hitStatistics.countMiss}]`;
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

            return `(${realPerformance.fc}pp for ${(realPerformance.fcAcc * 100).toFixed(2)}% FC)`;
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

        const openBeatmapButton = new ButtonBuilder()
            .setLabel("Beatmap Page")
            .setStyle(5)
            .setURL(score.beatmap.url);

        const userProfileButton = new ButtonBuilder()
            .setLabel("Player Profile")
            .setStyle(5)
            .setURL(`https://osu.ppy.sh/u/${score.user.id}`);

        const buttonsActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            openBeatmapButton,
            userProfileButton
        );

        return command.editReply({
            embeds: [embed],
            components: [buttonsActionRow],
        });
    },
};
