import { Client, Message } from "discord.js";
import { owners } from "./../../config.json";

import util from "util";

export default {
	name: "eval",
	help: {
		description: "no",
		syntax: "",
		example: "",
	},
	category: "management",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!args.join(" ")) return;
		if (owners.includes(message.author.id)) {
			let evaled;
			try {
				let argjoin = args.join(" ");
				evaled = await eval(argjoin);
				evaled = util.inspect(evaled, { depth: -1 });
				message.channel.send({
					embeds: [
						{
							title: "EVAL",
							color: "WHITE",
							fields: [
								{
									name: "▶️Input:",
									value: "`" + argjoin + "`",
								},
								{
									name: "◀️Result:",
									value: "`" + evaled + "`",
								},
							],
						},
					],
				});
			} catch (error) {
				console.log(error);
				message.reply({
					embeds: [
						{
							color: "RED",
							description: "🖨️ - __**Error**__\n`" + error + "`",
						},
					],
				});
			}
		} else {
			message.reply("❌|**You can't use this!**");
		}
	},
};
