import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetDisabled = new SlashCommandSubcommand(
    "disable",
    "Disable the system manually",
    false,
    undefined,
    [PermissionFlagsBits.ManageGuild]
);

verificationSetDisabled.setExecuteFunction(async (command) => {
    await command.deferReply();

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply(
            "This guild isn't validated, try again after some seconds.."
        );

    guild.verification.enable = false;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("✅ System disabled!")],
    });
});

export default verificationSetDisabled;
