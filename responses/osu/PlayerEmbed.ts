import { UserResponse } from "../../types/user";
import { Message, MessageAttachment } from "discord.js";
import parseUsergroup from "../../helpers/osu/player/getHighestUsergroup";
import generatePlayerRankChart from "../../helpers/osu/player/generatePlayerRankChart";
import parsePlayTime from "../../helpers/osu/player/parsePlayTime";
import moment from "moment";
import getEmoji from "../../helpers/text/getEmoji";

export default {
	send: async (user: UserResponse, message: Message, mode?: string) => {
		const attachment = user.data.statistics?.global_rank
			? new MessageAttachment(
					await generatePlayerRankChart(user.data),
					"rank.png"
			  )
			: undefined;

		const usergroup = parseUsergroup(user.data);

		const modesList: any = {
			osu: "",
			taiko: "taiko",
			catch: "catch",
			mania: "mania",
		};

		mode = mode ? mode : user.data.playmode.toString();

		message.channel.send({
			embeds: [
				{
					author: {
						url: `https://osu.ppy.sh/u/${user.data.id}`,
						name: `${user.data.username} • osu!${modesList[mode]} player info`,
						iconURL: usergroup.icon,
					},
					thumbnail: {
						url: `https://a.ppy.sh/${user.data.id}`,
					},
					description: `${getEmoji("SSH")} \`${
						user.data.statistics?.grade_counts.ssh || 0
					}\` **|** ${getEmoji("SH")} \`${
						user.data.statistics?.grade_counts.sh || 0
					}\` **|** ${getEmoji("SS")} \`${
						user.data.statistics?.grade_counts.ss || 0
					}\` **|** ${getEmoji("S")} \`${
						user.data.statistics?.grade_counts.s || 0
					}\` **|** ${getEmoji("A")} \`${
						user.data.statistics?.grade_counts.a || 0
					}\``,
					color: usergroup.colour,
					fields: [
						{
							name: "Ranking",
							value: `:earth_americas: \`#${
								user.data.statistics?.global_rank
									? user.data.statistics?.global_rank
									: "-"
							}\`
                            :flag_${user.data.country_code.toLowerCase()}: \`#${
								user.data.statistics?.country_rank
									? user.data.statistics?.country_rank
									: "-"
							}\``,
							inline: true,
						},
						{
							name: "Performance statistics",
							value: `**PP**: \`${Math.round(
								user.data.statistics?.pp
									? user.data.statistics?.pp
									: 0
							).toLocaleString("en-US")}\`
                            **Ranked Score**: \`${user.data.statistics?.ranked_score.toLocaleString(
								"en-US"
							)}\``,
							inline: true,
						},
						{
							name: "General statistics",
							value: `**Total Score**: \`${user.data.statistics?.total_score.toLocaleString(
								"en-US"
							)}\`
                            **Accuracy**: \`${
								user.data.statistics?.hit_accuracy
									? Number(
											user.data.statistics?.hit_accuracy.toFixed(
												2
											)
									  ).toLocaleString("en-US")
									: 0
							}\`
                            **Play Count**: \`${
								user.data.statistics?.play_count
									? Number(
											user.data.statistics?.play_count.toFixed(
												2
											)
									  ).toLocaleString("en-US")
									: 0
							}\`
                            **Play Time**: \`${parsePlayTime(
								user.data.statistics
							)}\``,
							inline: false,
						},
					],
					image: {
						url: "attachment://rank.png",
					},
					footer: {
						text: `${
							user.data.is_online
								? "🟢 Currently online"
								: `🔴 Offline${
										user.data.last_visit
											? " • " +
											  moment(
													user.data.last_visit
											  ).fromNow()
											: ""
								  }`
						}`,
					},
				},
			],
			files: attachment ? [attachment] : [],
		});
	},
};
