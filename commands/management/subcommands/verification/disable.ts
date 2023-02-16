import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetDisabled = new SlashCommandSubcommand(
    "disable",
    "Disable the system manually",
    undefined,
    [PermissionFlagsBits.ManageGuild]
);

verificationSetDisabled.setExecuteFunction(async (command) => {
    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    guild.verification.enable = false;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Verification system disabled!")],
    });
});

export default verificationSetDisabled;
