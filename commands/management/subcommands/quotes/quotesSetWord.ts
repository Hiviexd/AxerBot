import { PermissionFlagsBits } from "discord.js";
import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotesSetWord = new SlashCommandSubcommand(
    "word",
    "Sets a trigger word for the quotes system",
    {
        syntax: "/quotes `set` `word` `<new word>`",
    },
    [PermissionFlagsBits.ManageChannels]
);

quotesSetWord.builder.addStringOption((o) =>
    o.setName("word").setDescription("New word").setRequired(true)
);

quotesSetWord.setExecuteFunction(async (command) => {
    const word = command.options.getString("word", true);

    if (word == "")
        return command.editReply({
            embeds: [generateErrorEmbed("❗ Please specify a word.")],
        });

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    if (!command.guild) return;

    guild.fun.enable = true;
    guild.fun.word = word.toUpperCase();

    await database.guilds.updateOne(
        { _id: command.guildId },
        {
            fun: guild.fun,
        }
    );

    command.editReply({
        embeds: [generateSuccessEmbed(`✅ Trigger word set to \`${word}\`!`)],
    });
});

export default quotesSetWord;
