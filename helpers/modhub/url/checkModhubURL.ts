import { Message } from "discord.js";
import processModhubURL from "./processModhubURL";

export default (message: Message) => {
	const matches: URL[] = [];

	// ? Try to find modhub urls in the message
	message.content.split(" ").forEach((arg) => {
		arg = arg.trim();
		try {
			const url = new URL(arg);

			if (url.hostname == "osumodhub.xyz") matches.push(url);
		} catch (e) {
			void {};
		}
	});

	// ? Process all request permalink
	matches
		.filter(
			(u) =>
				u.pathname.split("/").includes("queue") &&
				u.searchParams.get("r")
		)
		.forEach((url) => {
			const request_id = url.searchParams.get("r");

			if (request_id) processModhubURL(url, "request", message);
		});
};
