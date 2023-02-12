import { PermissionFlagsBits } from "discord.js";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const loggingToggle = new SlashCommandSubcommand(
    "toggle",
    "Enable or disable logging system",
    false,
    undefined,
    [PermissionFlagsBits.ManageGuild]
);

loggingToggle.builder.addStringOption((o) =>
    o
        .setName("state")
        .setDescription("Enable or disable?")
        .setRequired(true)
        .addChoices(
            {
                name: "Enable",
                value: "enabled",
            },
            {
                name: "Disable",
                value: "disabled",
            }
        )
);

loggingToggle.setExecuteFunction(async (command) => {
    if (!command.guild || !command.member) return;

    await command.deferReply();

    const state = command.options.getString("state", true);

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    if (state == "enabled" && !guild.logging.channel)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "You need to set a channel before enable the system!"
                ),
            ],
        });

    guild.logging.enabled = state == "enabled";

    await database.guilds.findByIdAndUpdate(command.guildId, {
        $set: { logging: guild.logging },
    });

    return command.editReply({
        embeds: [
            generateSuccessEmbed(
                `${state == "enabled" ? "🟢" : "🔴"} Logging system ${state}!`
            ),
        ],
    });
});

export default loggingToggle;
