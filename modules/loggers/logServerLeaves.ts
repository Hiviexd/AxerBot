import { EmbedBuilder, GuildMember, PartialGuildMember, AuditLogEvent } from "discord.js";
import moment from "moment";
import * as database from "../../database";
import colors from "../../constants/colors";

export default async function logServerLeaves(member: GuildMember | PartialGuildMember) {
    try {
        const guild = await database.guilds.findOne({
            _id: member.guild.id,
        });

        if (!guild) return;

        if (guild.logging.enabled === false) return;

        if (!member.guild.channels.cache.get(guild.logging.channel)) return;

        const channel: any = member.guild.channels.cache.get(guild.logging.channel);
        if (!channel) return;

        const memberRoles = member.roles.cache
            .filter((roles) => roles.id !== member.guild.id)
            .map((role) => role.toString());

        const auditLogs = await member.guild.fetchAuditLogs({
            limit: 1,
        });

        const kickLog = auditLogs.entries.first();

        // this will be repetitive but idc
        const leaveEmbed = new EmbedBuilder()
            .setColor(colors.orange)
            .setAuthor({
                name: member.nickname
                    ? `${member.nickname} (${member.user.username})`
                    : member.user.username,
                iconURL: member.user.displayAvatarURL(),
            })
            .setDescription(`👋 ${member.user} has left the server`)
            .addFields(
                { name: "User id", value: member.id, inline: true },
                {
                    name: "Username",
                    value: member.user.username,
                    inline: true,
                }
            )
            .setTimestamp();
        member.nickname
            ? leaveEmbed.addFields({
                  name: "Nickname",
                  value: member.nickname,
                  inline: true,
              })
            : null;
        leaveEmbed
            .addFields({
                name: "Account created",
                value: `<t:${moment(member.user.createdAt).format("X")}:f>`,
                inline: false,
            })
            .addFields({
                name: "Joined server",
                value: member.joinedAt
                    ? `<t:${moment(member.joinedAt).format("X")}:f>`
                    : "*Unknown*",
                inline: false,
            });

        if (memberRoles.length > 0)
            leaveEmbed.addFields({ name: "Roles", value: memberRoles.join(", ") });

        if (!kickLog || kickLog.action !== AuditLogEvent.MemberKick)
            return await channel.send({ embeds: [leaveEmbed] }).catch((e: any) => console.error(e));

        const { executor, reason } = kickLog;

        const kickEmbed = new EmbedBuilder()
            .setColor(colors.darkRed)
            .setAuthor({
                name: executor?.username || "*Unknown*",
                iconURL: executor?.displayAvatarURL(),
            })
            .setDescription(`📤 ${executor} has kicked ${member.user}`);

        kickEmbed
            .addFields(
                { name: "User id", value: member.id, inline: true },
                {
                    name: "Username",
                    value: member.user.username,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Operator id", value: executor?.id || "*Unknown*", inline: true },
                {
                    name: "Operator username",
                    value: executor?.username || "*Unknown*",
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                {
                    name: "Account created",
                    value: `<t:${moment(member.user.createdAt).format("X")}:f>`,
                    inline: false,
                },
                {
                    name: "Joined server",
                    value: member.joinedAt
                        ? `<t:${moment(member.joinedAt).format("X")}:f>`
                        : "*Unknown*",
                    inline: false,
                }
            )
            .setTimestamp();

        if (memberRoles.length > 0)
            kickEmbed.addFields({ name: "Roles", value: memberRoles.join(", ") });

        if (reason) kickEmbed.addFields({ name: "Reason", value: reason });

        await channel.send({ embeds: [kickEmbed] });
    } catch (e) {
        console.error(e);
    }
}
