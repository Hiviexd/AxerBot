import { Client, Message, MessageEmbed } from "discord.js";
import createNewGuild from "../../database/utils/createNewGuild";
import createNewUser from "../../database/utils/createNewUser";
import * as database from "./../../database";
import osusetEmbed from "./subcommands/osuset/osusetEmbed";
import osusetUsername from "./subcommands/osuset/osusetUsername";

export default {
	name: "osuset",
	help: {
		description: "Sets your credentials so the bot recognizes you.",
		syntax: "{prefix}osuset `<field>` `<value>`",
		example:
			"{prefix}osuset `user` `Hivie`\n {prefix}osuset `user` `HEAVENLY MOON`",
	},
	category: "osu",
	subcommands: [osusetEmbed, osusetUsername],
	run: async (bot: Client, message: Message, args: Array<string>) => {
		let guild = await database.guilds.findById(message.guildId);

		if (!guild) return;

		message.reply(`Need help? Use \`${guild.prefix}help osuset\``);
	},
};
