import { PermissionFlagsBits } from "discord.js";
import * as database from "../../../../database";
import { parseTextFileAttachment } from "../../../../helpers/text/processText";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotesSetList = new SlashCommandSubcommand(
    "list",
    "Sets a custom list for the server quotes",
    false,
    {
        syntax: "/quotes `set` `list` `[Text File Attachment]`",
        note: "Quotes are split by line break.",
    },
    [PermissionFlagsBits.ManageChannels]
);

quotesSetList.builder.addAttachmentOption((o) =>
    o
        .setName("text_file")
        .setDescription("Text file with quotes")
        .setRequired(true)
);

quotesSetList.setExecuteFunction(async (command) => {
    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;
    const file = command.options.getAttachment("text_file", true);

    if (!command.guild) return;

    if (!file || file.contentType != "text/plain; charset=utf-8")
        return command.editReply({
            embeds: [generateErrorEmbed("❗ Please attach a text file.")],
        });

    // ? Prevent big files (It uses bytes)
    if (file.size > 200000)
        return command.editReply({
            embeds: [
                generateErrorEmbed("❌ File is too big. Max size is 200KB."),
            ],
        });

    const list = await parseTextFileAttachment(file.url);

    if (list.length < 1)
        return command.editReply({
            embeds: [generateErrorEmbed("❌ File is empty.")],
        });

    guild.fun.enable = true;
    guild.fun.phrases = list;

    await database.guilds.findOneAndUpdate(
        { _id: command.guildId },
        {
            fun: guild.fun,
        }
    );

    command.editReply({
        embeds: [generateSuccessEmbed("✅ Loaded the list!")],
    });
});

export default quotesSetList;
