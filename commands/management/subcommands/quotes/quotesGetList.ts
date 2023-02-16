import { AttachmentBuilder, PermissionFlagsBits } from "discord.js";

import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotesCustomFile = new SlashCommandSubcommand(
    "customfile",
    "Send custom list file for download",
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

quotesCustomFile.setExecuteFunction(async (command) => {
    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    if (!command.guild) return;

    if (guild.fun.mode != "custom")
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "❗ This server is not using a custom quote list."
                ),
            ],
        });

    const text = guild.fun.phrases.join("\n");
    const buffer = Buffer.from(text, "utf-8");
    const attachment = new AttachmentBuilder(buffer, {
        name: "List.txt",
    });

    command.editReply({
        content: "Current list:",
        files: [attachment],
    });
});

export default quotesCustomFile;
