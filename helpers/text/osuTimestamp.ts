import { Message, EmbedBuilder } from "discord.js";

export default function osuTimestamp(m: Message) {
	const timestampRegex = /(\d+):(\d{2}):(\d{3})\s*(\(((\d+(\|)?,?)+)\))?/gim;

	const timestamps = m.content.match(timestampRegex);
	if (!timestamps) return;

	let message = "";
	for (const timestamp of timestamps) {
		const res = timestampRegex.exec(timestamp);
		timestampRegex.lastIndex = 0;
		if (!res) continue;
		message += `[${timestamp}](https://axer-url.vercel.app/api/edit?time=${res[1]}:${res[2]}:${res[3]}`;
		if (res[4]) message += `-${res[4]}`;
		message += ")\n";
	}

    const embed = new EmbedBuilder()
        .setDescription(message)
        .setColor("#34343c");

	m.reply({
		embeds: [embed],
		allowedMentions: {
			repliedUser: false,
		},
	}).catch((e) => {
		console.error(e);
	});
}
