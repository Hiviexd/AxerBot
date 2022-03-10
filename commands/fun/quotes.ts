import { Client, Message } from "discord.js";
import createNewGuild from "../../database/utils/createNewGuild";
import * as database from "./../../database";

export default {
	name: "quotes",
	description: "Configure the random quotes system",
	syntax: "!quotes `<action>` `<value>`",
	example: "!quotes `set` `random`",
	category: "fun",
	run: (bot: Client, message: Message, args: string[]) => {
		const action = args.join(" ");

		switch (action) {
			case "set random": {
				setRandom();
				break;
			}
			case "set default": {
				setDefault();
				break;
			}
			case "set enabled": {
				toggle(true);
				break;
			}
			case "set disabled": {
				toggle(false);
				break;
			}
			default: {
				message.channel.send(
					"Invalid option! Possible options: `set default`, `set random`, `set enabled`, `set disabled`"
				);
			}
		}

		async function setRandom() {
			let guild = await database.guilds.findById(message.guildId);

			if (!message.guild) return;

			if (!guild) guild = await createNewGuild(message.guild);

			guild.fun.mode = "random";

			await database.guilds.updateOne(
				{ _id: message.guildId },
				{
					fun: guild.fun,
				}
			);

			message.channel.send("Done");
		}

		async function setDefault() {
			let guild = await database.guilds.findById(message.guildId);

			if (!message.guild) return;

			if (!guild) guild = await createNewGuild(message.guild);

			guild.fun.mode = "default";

			await database.guilds.updateOne(
				{ _id: message.guildId },
				{
					fun: guild.fun,
				}
			);

			message.channel.send("Done");
		}

		async function toggle(status: boolean) {
			let guild = await database.guilds.findById(message.guildId);

			if (!message.guild) return;

			if (!guild) guild = await createNewGuild(message.guild);

			guild.fun.enabled = status;

			await database.guilds.updateOne(
				{ _id: message.guildId },
				{
					fun: guild.fun,
				}
			);

			message.channel.send("Done");
		}
	},
};
