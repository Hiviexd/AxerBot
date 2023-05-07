import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const reportSetNoPing = new SlashCommandSubcommand(
    "ping",
    "Disable the ping when a report is sent",
    undefined,
    [PermissionFlagsBits.ManageGuild]
);

reportSetNoPing.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    guild.reports.ping = false;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Report pings disabled!")],
    });
});

export default reportSetNoPing;
