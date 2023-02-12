import { PermissionFlagsBits } from "discord.js";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";

const purge = new SlashCommand(
    ["purge", "clear"],
    "Deletes x amount of messages from a channel.\nMax amount is `99` because of Discord limitations.",
    "Management",
    false,
    undefined,
    [PermissionFlagsBits.ManageMessages]
);

purge.builder.addIntegerOption((o) =>
    o
        .setName("amount")
        .setDescription("How many messages?")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(98)
);

purge.setExecuteFunction(async (command) => {
    await command.deferReply();

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

export default purge;
