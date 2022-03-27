import { UserResponse } from "./../../types/user";
import { Message, MessageAttachment } from "discord.js";
import parseUsergroup from "../../utils/osu/user/parseUsergroup";
import generatePlayerRankChart from "../../utils/images/generatePlayerRankChart";
import parsePlayTime from "../../utils/osu/strings/parsePlayTime";

export default {
	send: async (user: UserResponse, message: Message) => {
		const attachment = new MessageAttachment(
			await generatePlayerRankChart(user.data),
			"rank.png"
		);

		const usergroup = parseUsergroup(user.data);

		message.channel.send({
			embeds: [
				{
					author: {
						url: `https://osu.ppy.sh/u/${user.data.id}`,
						name: `${user.data.username} • player info`,
						iconURL: usergroup.icon,
					},
					thumbnail: {
						url: `https://a.ppy.sh/${user.data.id}`,
					},
					description: `<:SSH:957381956981641267> \`${user.data.statistics?.grade_counts.ssh}\` **|** <:SH:957381935775236166> \`${user.data.statistics?.grade_counts.sh}\` **|** <:SS:957381945883508736> \`${user.data.statistics?.grade_counts.ss}\` **|** <:S:957381925113311273> \`${user.data.statistics?.grade_counts.s}\` **|** <:A:957381904137613351> \`${user.data.statistics?.grade_counts.a}\``,
					color: usergroup.colour,
					fields: [
						{
							name: "Ranking",
							value: `:earth_americas: \`#${
								user.data.statistics?.global_rank
							}\`
                            :flag_${user.data.country_code.toLowerCase()}: \`#${
								user.data.statistics?.country_rank
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
								: "🔴 Offline"
						}`,
					},
				},
			],
			files: [attachment],
		});
	},
};
