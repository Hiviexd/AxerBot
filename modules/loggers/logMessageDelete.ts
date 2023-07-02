import { ChannelType, EmbedBuilder, Message, PartialMessage, AuditLogEvent } from "discord.js";
import * as database from "../../database";
import truncateString from "../../helpers/text/truncateString";
import colors from "../../constants/colors";

export default async (message: Message<boolean> | PartialMessage) => {
    try {
        if (!message.author) return;
        if (message.author.bot) return;
        if (message.channel.type != ChannelType.GuildText) return;
        if (!message.member) return;
        if (!message.guild || !message.guild.channels) return;
        if (!message.cleanContent) return;

        const guild = await database.guilds.findOne({
            _id: message.guild.id,
        });

        if (!guild) return;
        if (guild.logging.enabled === false) return;
        if (!message.guild.channels.cache.get(guild.logging.channel)) return;

        const channel: any = message.guild.channels.cache.get(guild.logging.channel);
        if (!channel) return;

        const count = 1950;

        let truncatedMessage = truncateString(message.cleanContent, count);

        //split by line
        truncatedMessage = truncatedMessage.split("\n").join("\n- ");

        truncatedMessage = "```diff\n- " + truncatedMessage + "```";

        const auditLogs = await message.guild.fetchAuditLogs({
            limit: 1,
        });

        const deleteLog = auditLogs.entries.first();

        // this will be repetitive but idc
        const selfDeleteEmbed = new EmbedBuilder()
            .setColor(colors.red)
            .setAuthor({
                name: message.member.nickname
                    ? `${message.member.nickname} (${message.author.username})`
                    : message.author.username,
                iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(
                `❌ ${message.member.user} deleted a message from ${message.channel}\n\n**Message:** \n${truncatedMessage}`
            )
            .addFields(
                { name: "Message id", value: message.id, inline: true },
                {
                    name: "Message link",
                    value: message.url,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Channel id", value: message.channel.id, inline: true },
                {
                    name: "Channel name",
                    value: `#${message.channel.name}`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "User id", value: message.member.id, inline: true }
            )
            .setTimestamp();

        if (message.member.nickname)
            selfDeleteEmbed.addFields(
                {
                    name: "Nickname",
                    value: message.member.nickname,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                }
            );

        if (message.attachments.size > 0) {
            const img = message.attachments.first()?.url;

            if (img) {
                selfDeleteEmbed.setImage(img);
            }
        }

        if (!deleteLog || deleteLog.action !== AuditLogEvent.MessageDelete)
            return await channel
                .send({ embeds: [selfDeleteEmbed] })
                .catch((e: any) => console.error(e));

        const { executor } = deleteLog;

        const deleteEmbed = new EmbedBuilder()
            .setColor(colors.red)
            .setAuthor({
                name: executor?.username || "*Unknown*",
                iconURL: executor?.displayAvatarURL(),
            })
            .setDescription(
                `❌ ${executor} deleted ${message.member.user}'s message from from ${message.channel}\n\n**Message:** \n${truncatedMessage}`
            )
            .addFields(
                { name: "Message id", value: message.id, inline: true },
                {
                    name: "Message link",
                    value: message.url,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Channel id", value: message.channel.id, inline: true },
                {
                    name: "Channel name",
                    value: `#${message.channel.name}`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "User id", value: message.member.id, inline: true },
                {
                    name: "Username",
                    value: message.member.user.username,
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

        if (message.attachments.size > 0) {
            const img = message.attachments.first()?.url;

            if (img) {
                deleteEmbed.setImage(img);
            }
        }
        channel.send({ embeds: [deleteEmbed] }).catch((e: any) => console.error(e));
    } catch (e) {
        console.error(e);
    }
};
