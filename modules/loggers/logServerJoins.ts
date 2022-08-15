import { MessageEmbed, GuildMember, PartialGuildMember } from "discord.js";
import * as database from "../../database";

export default async function logServerJoins(member: GuildMember | PartialGuildMember) {
	try {
		const guild = await database.guilds.findOne({
			_id: member.guild.id,
		});

		if (!guild) return;

		if (guild.logging.enabled === false) return;

		if (!member.guild.channels.cache.get(guild.logging.channel)) return;

        const embed = new MessageEmbed()
            .setColor("#ffff55")
            .setAuthor({
                name: member.nickname ? `${member.nickname} (${member.user.tag})` : member.user.tag,
                iconURL: member.user.displayAvatarURL(),
            })
            .setDescription(
                `:beginner:  ${member.user} has joined the server ${member.guild.name}!`
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