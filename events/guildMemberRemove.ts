import { MessageEmbed, GuildMember, Client } from "discord.js";
import { consoleLog } from "../helpers/core/logger";
import * as database from "../database";

export default {
	name: "guildMemberRemove",
	execute(bot: Client) {
		try {
			bot.on("guildMemberRemove", async (member) => {
				const bot_user: any = bot.user;

				if (member.id == bot_user.id) return;

				if (!member.user) return;
				const guild = await database.guilds.findOne({
					_id: member.guild.id,
				});
				if (guild.logging.enabled === false) return;
				if (!member.guild.channels.cache.get(guild.logging.channel))
					return;

				const memberRoles = member.roles.cache
					.filter((roles) => roles.id !== member.guild.id)
					.map((role) => role.toString());
				const embed = new MessageEmbed()
					.setColor("#d97f36")
					.setAuthor(
						`${member.user.username}`,
						member.user.displayAvatarURL()
					)
					.setDescription(
						`:wave: ${member.user} has left the server!\n\n**Roles:** \n${memberRoles}`
					)
					.setTimestamp();

				consoleLog(
					"guildMemberRemove",
					`User ${member.user.tag} has left the server!`
				);

				const channel: any = member.guild.channels.cache.get(
					guild.logging.channel
				);
				if (!channel) return;

				channel.send({ embeds: [embed] });
			});
		} catch (e: any) {
			console.error(e);
		}
	},
};
