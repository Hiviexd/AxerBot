import { Message, PermissionFlagsBits } from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotesAddWord = new SlashCommandSubcommand(
    "word",
    "Adds a new phrase to the server custom quotes list",
    false,
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

quotesAddWord.builder.addStringOption((o) =>
    o
        .setName("phrase")
        .setDescription("Phrase that you want to add")
        .setRequired(true)
);

quotesAddWord.setExecuteFunction(async (command) => {
    let guild = await database.guilds.findById(command.guildId);

    if (!guild) return;

    if (guild.fun.mode != "custom")
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "❗ This server is not in custom quotes mode."
                ),
            ],
        });

    if (!command.guild) return;

    const phrase = command.options.getString("phrase", true);

    guild.fun.phrases.push(phrase);

    await database.guilds.updateOne(
        { _id: command.guildId },
        {
            fun: guild.fun,
        }
    );

    command.editReply({
        embeds: [generateSuccessEmbed(`✅ Phrase added!`)],
    });
});

export default quotesAddWord;
