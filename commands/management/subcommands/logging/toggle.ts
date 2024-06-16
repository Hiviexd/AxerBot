import { SlashCommandStringOption } from "discord.js";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const loggingToggle = new SlashCommandSubcommand()
    .setName("toggle")
    .setDescription("Enable or disable this system")
    .setPermissions("ManageGuild")
    .addOptions(
        new SlashCommandStringOption()
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

loggingToggle.setExecutable(async (command) => {
    if (!command.guild || !command.member) return;

    const state = command.options.getString("state", true);

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    if (state == "enabled" && !guild.logging.channel)
        return command.editReply({
            embeds: [generateErrorEmbed("You need to set a channel before enable the system!")],
        });

    guild.logging.enabled = state == "enabled";

    await database.guilds.findByIdAndUpdate(command.guildId, {
        $set: { logging: guild.logging },
    });

    return command.editReply({
        embeds: [
            generateSuccessEmbed(`${state == "enabled" ? "🟢" : "🔴"} Logging system ${state}!`),
        ],
    });
});

export { loggingToggle };
