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
    try {
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

        const channel: any = guild.reports.channel;

        if (!channel)
            return command.followUp({
                embeds: [generateErrorEmbed("The reports system in this server isn't active.")],
                ephemeral: true,
            });

        const embed = new EmbedBuilder()
            .setTitle(messageContent ? "⚠️ Message Report" : "⚠️ User Report")
            .setColor(messageContent ? colors.yellow : colors.yellowBright)
            .setAuthor({
                name: reporter.nickname ? reporter.nickname : command.user.username,
                iconURL: command.user.displayAvatarURL(),
            })
            .setDescription(`Reported user ${reportedUser} in ${command.channel}`);

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
                    ? `${reportedUser.nickname} (${reportedUser.user.username})`
                    : reportedUser.user.username,
                inline: true,
            },
            {
                name: "Reporter",
                value: reporter.nickname
                    ? `${reporter.nickname} (${command.user.username})`
                    : command.user.username,
                inline: true,
            },
            {
                name: "Channel",
                value: `#${(command.channel as GuildChannel).name}`,
                inline: true,
            }
        );

        if (messageContent) {
            embed.addFields({
                name: "Message Link",
                value: `${(command as MessageContextMenuCommandInteraction).targetMessage.url}`,
                inline: true,
            });
        }

        // Log the last 5 messages of the reported user in the reported channel
        const messages = await (command.channel as GuildTextBasedChannel).messages.fetch({
            limit: 100,
        });

        const userMessages = messages.filter((msg) => msg.author.id === reportedUser.id);

        const lastFiveUserMessages = Array.from(userMessages.values())
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
            .slice(-5);

        lastFiveUserMessages.forEach((msg) => {
            embed.addFields({
                name: `<t:${Math.floor(msg.createdTimestamp / 1000)}:R>:`,
                value: truncateString(msg.content, 1024),
            });
        });

        const reportsChannel = await command.client.channels.fetch(channel);

        if (!reportsChannel || !reportsChannel.isTextBased())
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
            .catch((error) => {
                console.error(error);

                command.followUp({
                    embeds: [
                        generateErrorEmbed(
                            `Error sending the report!\n**Reason:** ${error.message}`
                        ),
                    ],
                    ephemeral: true,
                });
            })
            .then(() => {
                command.followUp({
                    embeds: [generateSuccessEmbed("User reported!")],
                    ephemeral: true,
                });
            });
    } catch (e) {
        console.error(e);

        command.followUp({
            embeds: [generateErrorEmbed(`Something went wrong!`)],
            ephemeral: true,
        });
    }
}
