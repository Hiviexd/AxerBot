import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetEnabled = new SlashCommandSubcommand(
    "enable",
    "Enable the system manually",
    false,
    undefined,
    [PermissionFlagsBits.ManageGuild]
);

verificationSetEnabled.setExecuteFunction(async (command) => {
    await command.deferReply();

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply(
            "This guild isn't validated, try again after some seconds.."
        );

    if (!guild.verification.channel)
        return command.editReply(
            ":x: You need to set a channel before enable the system!"
        );

    guild.verification.enable = true;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("✅ System enabled!")],
    });
});

export default verificationSetEnabled;
