import {
    ChannelType,
    EmbedBuilder,
    GuildTextBasedChannel,
    Message,
    PartialMessage,
} from "discord.js";
import colors from "../../constants/colors";
import * as database from "../../database";
import truncateString from "../../helpers/text/truncateString";

export default async (
    oldMessage: Message<boolean> | PartialMessage,
    newMessage: Message<boolean> | PartialMessage
) => {
    try {
        // TODO: add proper console logs to these errors
        if (
            !oldMessage?.author ||
            !oldMessage?.content ||
            !oldMessage?.cleanContent ||
            !oldMessage?.guild ||
            oldMessage?.author?.bot ||
            oldMessage?.channel?.type != ChannelType.GuildText ||
            !newMessage?.content ||
            !newMessage?.author ||
            !newMessage?.cleanContent ||
            !newMessage?.guild ||
            !newMessage?.member
        )
            return;

        const guild = await database.guilds.findOne({
            _id: oldMessage.guild.id,
        });
        if (!guild) return;

        if (guild.logging.enabled === false) return;

        if (!newMessage.guild.channels.cache.get(guild.logging.channel)) return;
        if (oldMessage.content === newMessage.content) return;

        const count = 1950;

        let original = truncateString(oldMessage.cleanContent, count);

        //split by line
        original = original.split("\n").join("\n- ");

        original = "```diff\n- " + original + "```";

        let edited = truncateString(newMessage.cleanContent, count);

        //split by line
        edited = edited.split("\n").join("\n+ ");

        edited = "```diff\n+ " + edited + "```";

        const embed = new EmbedBuilder()
            .setColor(colors.blue)
            .setAuthor({
                name: newMessage.member.nickname
                    ? `${newMessage.member.nickname} (${newMessage.author.username})`
                    : newMessage.author.username,
                iconURL: newMessage.author.displayAvatarURL(),
            })
            .setDescription(
                `📝 ${newMessage.member.user} edited a message in ${newMessage.channel}\n\n**Before:** \n${original}\n**After:** \n${edited}\n`
            )
            .addFields(
                { name: "Message id", value: newMessage.id, inline: true },
                {
                    name: "Message link",
                    value: newMessage.url,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                {
                    name: "Channel id",
                    value: newMessage.channel.id,
                    inline: true,
                },
                {
                    name: "Channel name",
                    value: `#${
                        (oldMessage.channel as GuildTextBasedChannel).name
                    }`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "User id", value: newMessage.member.id, inline: true }
            )
            .setTimestamp();

        if (newMessage.member.nickname)
            embed.addFields(
                {
                    name: "Nickname",
                    value: newMessage.member.nickname,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                }
            );

        if (newMessage.attachments.size > 0) {
            let img: any = newMessage.attachments.first();
            embed.setImage(img.url);
        }

        let channel: any = newMessage.guild.channels.cache.get(
            guild.logging.channel
        );

        if (!channel) return;

        channel.send({ embeds: [embed] }).catch((e: any) => console.error(e));
    } catch (e) {
        console.error(e);
    }
};
