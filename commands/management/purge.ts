import { PermissionFlagsBits, SlashCommandIntegerOption } from "discord.js";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const purge = new SlashCommand()
    .setName("purge")
    .setNameAliases("clear")
    .setDescription(
        "Deletes x amount of messages from a channel.\nMax amount is `98` because of Discord limitations."
    )
    .setCategory(CommandCategory.Management)
    .setPermissions("ManageMessages")
    .addOptions(
        new SlashCommandIntegerOption()
            .setName("amount")
            .setDescription("How many messages?")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(98)
    );

purge.setExecutable(async (command) => {
    let purge = (channel: any, amount: number) => {
        channel.bulkDelete(amount + 1).catch((e: any) => {
            command.editReply({
                embeds: [
                    generateErrorEmbed(
                        e.httpStatus == 403
                            ? "❌ I don't have `MANAGE_MESSAGES` permission to do this."
                            : "❌ Due to Discord Limitations, I cannot delete more than 98 messages, or messages older than 14 days."
                    ),
                ],
            });
        });
    };

    if (!command.member) return;

    if (typeof command.member?.permissions == "string") return;

    if (!command.channel || !command.channel.isTextBased()) return;

    const amount = command.options.getInteger("amount", true);

    purge(command.channel, amount);
});

export { purge };
