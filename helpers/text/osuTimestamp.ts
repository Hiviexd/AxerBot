import { Message } from "discord.js";

export default function osuTimestamp(m: Message) {
	const timestampRegex = /(\d+):(\d{2}):(\d{3})\s*(\(((\d,?)+)\))?/gim;

	const timestamps = m.content.match(timestampRegex);
	if (!timestamps) return;

	let message = "";
	for (const timestamp of timestamps) {
		const res = timestampRegex.exec(timestamp);
		timestampRegex.lastIndex = 0;
		if (!res) continue;
		message += `<osu://edit/${res[1]}:${res[2]}:${res[3]}`;
		if (res[4]) message += `-${res[4]}`;
		message += ">\n";
	}
	m.channel.send(message);
}
