import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetEnabled = new SlashCommandSubcommand()
    .setName("enable")
    .setDescription("Enable the system manually")
    .setPermissions("ManageGuild");

verificationSetEnabled.setExecutable(async (command) => {
    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    if (!guild.verification.channel)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "You need to set a channel first, use `/verification set channel`"
                ),
            ],
        });

    guild.verification.enable = true;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Verification system enabled!")],
    });
});

export { verificationSetEnabled };
