import { MessageEmbed, GuildMember, PartialGuildMember } from "discord.js";
import * as database from "../../database";

export default async function logServerLeaves(member: GuildMember | PartialGuildMember) {
	try {
		const guild = await database.guilds.findOne({
			_id: member.guild.id,
		});

		if (!guild) return;

		if (guild.logging.enabled === false) return;

		if (!member.guild.channels.cache.get(guild.logging.channel)) return;

		const memberRoles = member.roles.cache
			.filter((roles) => roles.id !== member.guild.id)
			.map((role) => role.toString());

		const embed = new MessageEmbed()
			.setColor("#d97f36")
			.setAuthor({
				name: member.nickname ? `${member.nickname} (${member.user.tag})` : member.user.tag,
				iconURL: member.user.displayAvatarURL(),
			})
			.setDescription(
				`:wave: ${member.user} has left the server ${member.guild.name}!\n\n**Roles:** \n${memberRoles}`
			)
			.setTimestamp();

		const channel: any = member.guild.channels.cache.get(
			guild.logging.channel
		);
		if (!channel) return;

		channel.send({ embeds: [embed] });
	} catch (e) {
		console.error(e);
	}
}
