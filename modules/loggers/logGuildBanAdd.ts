import { EmbedBuilder, GuildBan, AuditLogEvent } from "discord.js";
import moment from "moment";
import * as database from "../../database";
import colors from "../../constants/colors";

export default async function logGuildBanAdd(ban: GuildBan) {
    try {
        const guild = await database.guilds.findOne({
            _id: ban.guild.id,
        });

        if (!guild) return;

        if (guild.logging.enabled === false) return;

        if (!ban.guild.channels.cache.get(guild.logging.channel)) return;

        const auditLogs = await ban.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberBanAdd,
            limit: 1,
        });

        const banLog = auditLogs.entries.first();

        if (!banLog) return;

        const { executor, reason } = banLog;

        const embed = new EmbedBuilder()
            .setColor(colors.darkRed)
            .setAuthor({
                name: executor?.username || "*Unknown*",
                iconURL: executor?.displayAvatarURL(),
            })
            .setDescription(`⛔ ${executor} has banned ${ban.user}`)
            .addFields(
                { name: "User id", value: ban.user.id, inline: true },
                {
                    name: "Username",
                    value: ban.user.username,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Operator id", value: executor?.id || "*Unknown*", inline: true },
                {
                    name: "Operator",
                    value: executor?.username || "*Unknown*",
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true }
            )

            .setTimestamp();
        embed
            .addFields({
                name: "Account created",
                value: `<t:${moment(ban.user.createdAt).format("X")}:f>`,
                inline: false,
            })
            .addFields({
                name: "Ban reason",
                value: reason ? reason : "*N/A*",
                inline: false,
            });

        const channel: any = ban.guild.channels.cache.get(guild.logging.channel);

        if (!channel) return;

        await channel.send({ embeds: [embed] });
    } catch (e: any) {
        console.error(e);
    }
}
