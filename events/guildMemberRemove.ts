import { MessageEmbed, GuildMember, Client } from "discord.js";
import { consoleLog } from "../utils/core/logger";

export default {
	name: "guildMemberRemove",
	execute(bot: Client) {
		try {
			bot.on("guildMemberRemove", (member) => {
				if (
					!member.guild.channels.cache.find(
						(c) => c.name === "wasteland"
					)
				)
					return;

				if (!member.user) return;

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

				const channel: any = member.guild.channels.cache
					.filter((c) => c.name === "wasteland")
					.first();

				if (!channel) return;

				channel.send({ embeds: [embed] });
			});
		} catch (e: any) {
			console.error(e);
		}
	},
};
