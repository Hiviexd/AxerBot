import { MessageEmbed, GuildMember, PartialGuildMember } from "discord.js";
import moment from "moment";
import * as database from "../../database";

export default async function logServerLeaves(
	member: GuildMember | PartialGuildMember
) {
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
				name: member.nickname
					? `${member.nickname} (${member.user.tag})`
					: member.user.tag,
				iconURL: member.user.displayAvatarURL(),
			})
			.setDescription(`:wave: ${member.user} has left the server.`)
			.addField("User id", member.id, true)
			.addField("User tag", member.user.tag, true)

			.setTimestamp();
		member.nickname
			? embed.addField("Nickname", member.nickname, true)
			: null;
		embed
			.addField(
				"Account created",
				`<t:${moment(member.user.createdAt).format("X")}:f>`,
				false
			)
			.addField(
				"Joined server",
				member.joinedAt
					? `<t:${moment(member.joinedAt).format("X")}:f>`
					: "*Unknown*",
				false
			);
		memberRoles.length > 0
			? embed.addField("Roles", memberRoles.join(", "))
			: null;

		const channel: any = member.guild.channels.cache.get(
			guild.logging.channel
		);
		if (!channel) return;

		channel.send({ embeds: [embed] });
	} catch (e) {
		console.error(e);
	}
}
