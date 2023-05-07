import {
    Attachment,
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildChannel,
    GuildMember,
    GuildTextBasedChannel,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction,
} from "discord.js";
import { guilds } from "../../database";
import colors from "../../constants/colors";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import truncateString from "../../helpers/text/truncateString";

export async function SendReportEmbed({
    command,
    reporter,
    reportedUser,
    reason,
    image,
    messageContent,
}: {
    command:
        | ChatInputCommandInteraction
        | MessageContextMenuCommandInteraction
        | UserContextMenuCommandInteraction;
    reporter: GuildMember;
    reportedUser: GuildMember;
    reason: string;
    messageContent?: string;
    image?: Attachment | null;
}) {
    let guild = await guilds.findById(command.guildId);

    if (!guild || !command.guild)
        return command.followUp({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
            ephemeral: true,
        });

    const channel = guild.reports.channel;

    if (!channel)
        return command.followUp({
            embeds: [
                generateErrorEmbed(
                    "The reports system in this server isn't active."
                ),
            ],
            ephemeral: true,
        });

    const embed = new EmbedBuilder()
        .setTitle(messageContent ? "⚠️ Message Report" : "⚠️ User Report")
        .setColor(messageContent ? colors.yellow : colors.yellowBright)
        .setAuthor({
            name: reporter.nickname ? reporter.nickname : command.user.username,
            iconURL: command.user.displayAvatarURL(),
        })
        .setDescription(`Reported user ${reportedUser} in ${command.channel}`)
        .setTimestamp();

    if (image) embed.setImage(image.url);

    if (messageContent)
        embed.addFields({
            name: "Message",
            value: truncateString(messageContent, 1024),
        });

    embed.addFields(
        {
            name: "Reason",
            value: truncateString(reason, 1024),
        },
        {
            name: "Reported",
            value: reportedUser.nickname
                ? `${reportedUser.nickname} (${reportedUser.user.tag})`
                : reportedUser.user.tag,
            inline: true,
        },
        {
            name: "Reporter",
            value: reporter.nickname
                ? `${reporter.nickname} (${command.user.tag})`
                : command.user.tag,
            inline: true,
        },
        {
            name: "Channel",
            value: `#${(command.channel as GuildChannel).name}`,
            inline: true,
        },
        {
            name: "Reported ID",
            value: reportedUser.id,
            inline: true,
        },
        {
            name: "Reporter ID",
            value: reporter.id,
            inline: true,
        }
    );

    if (messageContent)
        embed.addFields({
            name: "Message Link",
            value: `${
                (command as MessageContextMenuCommandInteraction).targetMessage
                    .url
            }`,
            inline: true,
        });

    const reportsChannel: GuildTextBasedChannel | undefined =
        command.guild.channels.cache.get(channel) as GuildTextBasedChannel;

    if (!reportsChannel)
        return command.followUp({
            embeds: [
                generateErrorEmbed(
                    "Cannot find reports channel as it may not exist. Please notify the server administrators."
                ),
            ],
            ephemeral: true,
        });

    reportsChannel
        .send({
            content: guild.reports.ping ? `<@&${guild.reports.role}>` : "",
            embeds: [embed],
        })
        .catch(console.error)
        .then(() => {
            command.followUp({
                embeds: [generateSuccessEmbed("User reported!")],
                ephemeral: true,
            });
        });
}
