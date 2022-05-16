import { Client, Message } from "discord.js";
import owoify from "owoify-js";

export default {
	name: "owoify",
	help: {
		description: "Turn your text into owo text!\n I'm not sorry.",
		syntax: "{prefix}owoify `<text>`",
	},
	category: "fun",
	run: (bot: Client, message: Message, args: string[]) => {
		if (!args[0])
			return message.channel.send(
				"U nyeed two pwovide swomwe text to owoify!"
			);
		message.channel.send(owoify(args.join(" ")));
	},
};
