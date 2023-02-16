import { PermissionFlagsBits } from "discord.js";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotesSetChance = new SlashCommandSubcommand(
    "chance",
    "Set a chance between 1->100 to reply with a quote after the trigger word is detected",
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

quotesSetChance.builder.addIntegerOption((o) =>
    o
        .setName("chance")
        .setDescription("Chance number (percentage)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
);

quotesSetChance.setExecuteFunction(async (command) => {
    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    if (!command.guild) return;

    const chance = command.options.getInteger("chance", true);

    guild.fun.chance = chance;

    await database.guilds.updateOne(
        { _id: command.guildId },
        {
            fun: guild.fun,
        }
    );

    command.editReply({
        embeds: [
            generateSuccessEmbed(
                `✅ Successfully set the chance to ${chance}%`
            ),
        ],
    });
});

export default quotesSetChance;
