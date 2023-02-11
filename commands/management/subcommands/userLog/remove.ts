import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "log",
	group: "remove",
	help: {
		description: "remove a log from a user",
		syntax: "/userlog `remove` `<user>` `<logid>`",
	},
	run: async (command: ChatInputCommandInteraction, args: string[]) => {
		if (!command.guild || !command.member) return;

		await command.deferReply();

		const user = command.options.getString("username", true).toLowerCase();
		const logid = command.options.getInteger("logid", true);

		let guild = await database.guilds.findById(command.guildId);
		if (!guild) return;

		const userLogs = guild.user_logs.find((log) => log.username == user);
		let reason = null;

		if (!userLogs) {
			return command.editReply({
				embeds: [generateErrorEmbed("User not found!")],
			});
		} else {
			if (userLogs.logs.length < logid || logid < 1) {
				return command.editReply({
					embeds: [generateErrorEmbed("Log not found!")],
				});
			} else {
				//sort userlogs by date from newest to oldest
				userLogs.logs.sort((a, b) => {
					return (
						new Date(b.date || new Date()).valueOf() -
						new Date(a.date || new Date()).valueOf()
					);
				});

				reason = userLogs.logs[logid - 1].reason?.toString();

				userLogs.logs.splice(logid - 1, 1);
			}
		}

		await database.guilds.findByIdAndUpdate(command.guildId, {
			$set: { user_logs: guild.user_logs },
		});

		const embed = new EmbedBuilder()
			.setTitle("🗑️ Removed Log")
			.addField("User", user)
			.addField("Reason", reason ? reason : "No reason provided")
			.setFooter({
				text: `${command.user.tag}`,
				iconURL: command.user.displayAvatarURL(),
			});

		return command.editReply({
			embeds: [embed],
		});
	},
};
