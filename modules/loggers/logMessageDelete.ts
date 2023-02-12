import { ChannelType, EmbedBuilder, Message, PartialMessage } from "discord.js";
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

        const count = 1950;

        const truncatedMessage = truncateString(message.cleanContent, count);

        const embed = new EmbedBuilder()
            .setColor(colors.red)
            .setAuthor({
                name: message.member.nickname
                    ? `${message.member.nickname} (${message.author.tag})`
                    : message.author.tag,
                iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(
                `❌ ${message.member.user} deleted a message from ${message.channel}\n\n**Message:** \n${truncatedMessage}`
            )
            .addFields(
                { name: "Message id", value: message.id, inline: true },
                {
                    name: "Message link",
                    value: `[Message](${message.url})`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Channel id", value: message.channel.id, inline: true },
                {
                    name: "Channel name",
                    value: message.channel.name,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "User id", value: message.member.id, inline: true },
                {
                    name: "User tag",
                    value: message.member.user.tag,
                    inline: true,
                }
            )
            .setTimestamp();
        message.member.nickname
            ? embed.addFields({
                  name: "Nickname",
                  value: message.member.nickname,
                  inline: true,
              })
            : embed.addFields({
                  name: "\u200b",
                  value: "\u200b",
                  inline: true,
              });

        if (message.attachments.size > 0) {
            const img = message.attachments.first()?.url;

            if (img) {
                embed.setImage(img);
            }
        }

        const channel: any = message.guild.channels.cache.get(
            guild.logging.channel
        );
        if (!channel) return;

        channel.send({ embeds: [embed] }).catch((e: any) => console.error(e));
    } catch (e) {
        console.error(e);
    }
};
