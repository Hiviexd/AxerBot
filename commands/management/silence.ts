import {
    SlashCommandUserOption,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption,
    EmbedBuilder,
    GuildMember,
} from "discord.js";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import colors from "../../constants/colors";
import truncateString from "../../helpers/text/truncateString";

const silence = new SlashCommand()
    .setName("silence")
    .setDescription("Silence a user via a timeout")
    .setCategory(CommandCategory.Management)
    .setPermissions("ManageRoles")
    .addOptions(
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("User to silence")
            .setRequired(true),
        new SlashCommandIntegerOption()
            .setName("time")
            .setDescription("Time to silence the user")
            .setRequired(true)
            .addChoices(
                {
                    name: "1 hour",
                    value: 60 * 60 * 1000,
                },
                {
                    name: "1 day",
                    value: 24 * 60 * 60 * 1000,
                },
                {
                    name: "1 week",
                    value: 7 * 24 * 60 * 60 * 1000,
                }
            ),
        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("Reason for silence")
            .setRequired(true),
        new SlashCommandBooleanOption()
            .setName("notify")
            .setDescription("Notify the user of the silence")
            .setRequired(true)
    );

silence.setExecutable(async (command) => {
    if (!command.guild || !command.member) return;
    if (typeof command.member?.permissions == "string") return;

    const guildMember = command.options.getMember("user") as GuildMember;
    const time = command.options.getInteger("time", true);
    const reason = command.options.getString("reason", true);
    const notify = command.options.getBoolean("notify", true);

    if (!guildMember) {
        return command.editReply({
            embeds: [generateErrorEmbed("User not found!")],
        });
    }

    const timeoutOption =
        time === 60 * 60 * 1000 ? "1 hour" : time === 24 * 60 * 60 * 1000 ? "1 day" : "1 week";

    try {
        await guildMember.disableCommunicationUntil(null);
        await guildMember.timeout(time, reason);

        let isNotified = false;
        let embeds = [];

        if (notify) {
            try {
                await guildMember.send(
                    `You have been timed out for **${timeoutOption}** for the following reason: \`${truncateString(reason, 512)}\`\n\n *Sent from ${command.guild.name}*`
                );
                isNotified = true;
            } catch (e) {
                const failEmbed = new EmbedBuilder()
                    .setDescription(
                        `Failed to notify ${guildMember} about their silence, they possibly have DMs limited to friends only.`
                    )
                    .setColor(colors.red);
                embeds.push(failEmbed);
            }
        }

        const mainEmbed = new EmbedBuilder()
            .setTitle("🛑 User silenced")
            .setDescription(`User ${guildMember} has been silenced via a timeout.`)
            .setColor(colors.darkRed)
            .setAuthor({
                name: command.user.username,
                iconURL: command.user.displayAvatarURL(),
            })
            .addFields(
                { name: "Culprit", value: guildMember.user.username, inline: true },
                { name: "Moderator", value: command.user.username, inline: true },
                { name: "Time", value: timeoutOption, inline: true },
                { name: "Reason", value: truncateString(reason, 512), inline: true }
            )
            .setFooter({ text: isNotified ? "🟢 User notified" : "🔴 User not notified" });

        embeds.unshift(mainEmbed);

        return command.editReply({ embeds });
    } catch (e) {
        console.error(e);
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Failed to silence the user, you might not have the required permissions."
                ),
            ],
        });
    }
});

export { silence };
