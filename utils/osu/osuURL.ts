import { Message } from "discord.js";
import parseUser from "./url/parseUser";

export default (message: Message) => {
	const links: string[] = [];
	const args = message.content.toLowerCase().trim().split(" ");

	args.forEach((arg) => {
		if (arg.startsWith("https://osu.ppy.sh/")) links.push(arg);
	});

	links.forEach((link) => {
		if (link.split("/").includes("users")) parseUser(link, message);
	});
};
