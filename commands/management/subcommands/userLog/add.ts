import {
	ChatInputCommandInteraction,
	GuildMember,
	EmbedBuilder,
} from "discord.js";
import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import colors from "../../../../constants/colors";

export default {
	name: "log",
	group: "add",
	help: {
		description: "log a user",
		syntax: "/userlog `add` `<user>` `<reason>`",
	},
	run: async (command: ChatInputCommandInteraction, args: string[]) => {
		if (!command.guild || !command.member) return;

		await command.deferReply();

		const user = command.options.getString("username", true).toLowerCase();
		const reason = command.options.getString("reason", true);

		if (reason.length > 1000) {
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"Reason is too long! (1000 characters max)"
					),
				],
			});
		}

		let guild = await database.guilds.findById(command.guildId);
		if (!guild) return;

		const userLogs = guild.user_logs.find((log) => log.username == user);

		if (!userLogs) {
			guild.user_logs.push({
				username: user,
				logs: [
					{
						reason: reason,
						date: new Date(),
					},
				],
			});
		} else {
			userLogs.logs.push({
				reason: reason,
				date: new Date(),
			});
		}

		await database.guilds.findByIdAndUpdate(command.guildId, {
			$set: { user_logs: guild.user_logs },
		});

		const embed = new EmbedBuilder()
			.setTitle("✅ User Logged")
			.setColor(colors.green)
			.addField("User", user)
			.addField("Reason", reason)
			.setFooter({
				text: `${command.user.tag}`,
				iconURL: command.user.displayAvatarURL(),
			});

		return command.editReply({
			embeds: [embed],
		});
	},
};
