import { PermissionFlagsBits } from "discord.js";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotestSetType = new SlashCommandSubcommand(
    "type",
    "Change quotes system list to default list or custom list",
    false,
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

quotestSetType.builder.addStringOption((o) =>
    o
        .setName("type")
        .setDescription("Select list type")
        .addChoices(
            {
                name: "default",
                value: "default",
            },
            {
                name: "custom",
                value: "custom",
            }
        )
        .setRequired(true)
);

quotestSetType.setExecuteFunction(async (command) => {
    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    if (!command.guild) return;

    const type = command.options.getString("type", true);

    guild.fun.enable = true;
    guild.fun.mode = type;

    await database.guilds.updateOne(
        { _id: command.guildId },
        {
            fun: guild.fun,
        }
    );

    command.editReply({
        embeds: [generateSuccessEmbed(`✅ Switched mode to ${type}.`)],
    });
});

export default quotestSetType;
