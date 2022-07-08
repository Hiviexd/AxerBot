import { Client, Message } from "discord.js";
import { owners } from "../../config.json";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import * as db from "./../../database";

import util from "util";

export default {
	name: "eval",
	help: {
		description:
			"Developer-exclusive command that allows you to execute arbitrary code.\n Usually used for debugging purposes.",
		syntax: "{prefix}eval `<code>`",
		example: '{prefix}eval `message.channel.send("Hello World!")`',
	},
	category: "dev",
	run: async (bot: Client, message: Message, args: string[]) => {
		const database: any = db;
		try {
			if (!args.join(" ")) return;
			if (owners.includes(message.author.id)) {
				let evaled;
				try {
					let argjoin = args.join(" ");
					evaled = await eval(argjoin);
					evaled = util.inspect(evaled, { depth: -1 });
					message.channel
						.send({
							embeds: [
								{
									title: "Eval",
									color: "WHITE",
									fields: [
										{
											name: "▶️ Input:",
											value: "`" + argjoin + "`",
										},
										{
											name: "◀️ Result:",
											value: "`" + evaled + "`",
										},
									],
								},
							],
						})
						.catch(console.error);
				} catch (error) {
					console.log(error);
					message
						.reply({
							embeds: [
								{
									color: "RED",
									description:
										"🖨️ - __**Error**__\n`" + error + "`",
								},
							],
						})
						.catch(console.error);
				}
			} else {
				message.reply({
					embeds: [
						generateErrorEmbed(
							"❌ **Only bot developers allowed to use this!**"
						),
					],
				});
			}
		} catch (e) {
			console.error(e);
		}
	},
};
