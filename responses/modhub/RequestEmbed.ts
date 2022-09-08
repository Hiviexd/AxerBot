import { ColorResolvable, Message, MessageEmbed } from "discord.js";
import relativeTime from "../../helpers/general/relativeTime";
import ModhubFetcher from "../../helpers/modhub/ModhubFetcher";

export default async (url: URL, message: Message) => {
	const request_id = url.searchParams.get("r");

	if (!request_id) return;

	const request = await ModhubFetcher.RequestsFecher.fetchRequest(request_id);

	if (request.data.status != 200) return;

	const texts: { [key: string]: string } = {
		pending: "Pending",
		rechecking: "Need Recheck",
		waiting: "Waiting another BN",
		finished: "Modded",
		nominated: "Nominated",
		ranked: "Ranked",
		rejected: "Rejected",
		accepted: "Accepted",
		archived: "Archived",
	};

	const colors: { [key: string]: ColorResolvable } = {
		rechecking: "#cf3274",
		accepted: "#25ca6a",
		finished: "#259bca",
		nominated: "#259bca",
		ranked: "#259bca",
		rejected: "#d4152f",
		waiting: "#f44336",
	};

	const emojis: { [key: string]: string } = {
		rechecking: "🟣",
		accepted: "🟢",
		finished: "🔵",
		nominated: "🔵",
		ranked: "🔵",
		rejected: "🔴",
		waiting: "🟠",
	};

	const queue = await ModhubFetcher.QueueFetcher.fetchQueue(
		request.data.data._queue
	);

	const embed = new MessageEmbed()
		.setAuthor({
			name: `${request.data.data._owner_name} • ${
				emojis[request.data.data.status]
			} Beatmap ${texts[request.data.data.status]}`,
		})
		.setThumbnail(`https://a.ppy.sh/${request.data.data._owner}`)
		.setImage(request.data.data.beatmap.covers["cover@2x"])
		.addField(
			"Modder Feedback",
			request.data.data.reply || "No feedback provided..."
		)
		.addField(
			"Requester Comment",
			request.data.data.comment || "No comment provided...",
			true
		)
		.setColor(colors[request.data.data.status])
		.setFooter({
			text: `Requested to ${queue.data.data.name}`,
		})
		.setTimestamp(request.data.data.date);

	message.reply({
		embeds: [embed],
		allowedMentions: {
			repliedUser: false,
		},
	});
};
