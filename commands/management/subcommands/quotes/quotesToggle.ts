import { PermissionFlagsBits } from "discord.js";

import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotesToggle = new SlashCommandSubcommand(
    "toggle",
    "Disable or enable quotes system",
    false,
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

quotesToggle.builder.addStringOption((o) =>
    o
        .setName("status")
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

quotesToggle.setExecuteFunction(async (command) => {
    await command.deferReply();

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    if (!command.guild) return;

    const status = command.options.getString("status", true);

    guild.fun.enable = status == "enabled";

    await database.guilds.updateOne(
        { _id: command.guildId },
        {
            fun: guild.fun,
        }
    );

    command.editReply({
        embeds: [generateSuccessEmbed(`✅ quotes system is ${status}.`)],
    });
});

export default quotesToggle;
