import { ChannelType, PermissionFlagsBits, SlashCommandStringOption } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetChannel = new SlashCommandSubcommand()
    .setName("channel")
    .setDescription("Change system's channel")
    .addOptions(
        new SlashCommandStringOption()
            .setName("channel")
            .setDescription("System channel")
            .setRequired(true)
    )
    .setPermissions("ModerateMembers");

verificationSetChannel.setExecutable(async (command) => {
    const channel = command.options.getChannel("channel", true);

    if (channel.type != ChannelType.GuildText)
        return command.editReply({
            embeds: [generateErrorEmbed("You need to provide a **TEXT** channel.")],
        });

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    guild.verification.enable = true;
    guild.verification.channel = channel.id;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [
            generateSuccessEmbed(
                `Verification system is enabled and channel is set to <#${channel.id}>!`
            ),
        ],
    });
});

export { verificationSetChannel };
