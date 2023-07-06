import { randomUUID } from "crypto";
import {
    ActionRowBuilder,
    InteractionCollector,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import util from "util";
import config from "../../config.json";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import truncateString from "../../helpers/text/truncateString";
import { SlashCommand } from "../../models/commands/SlashCommand";
import MissingPermissions from "../../responses/embeds/MissingPermissions";

const evalCommand = new SlashCommand(
    "eval",
    "Evaluate code",
    "Developers",
    true,
    undefined,
    [],
    true
);

evalCommand.setExecuteFunction(async (command) => {
    if (!config.owners.includes(command.user.id))
        return command.editReply({
            embeds: [MissingPermissions],
        });

    const handshakeId = randomUUID();
    const modal = new ModalBuilder().setTitle("Evaluate").setCustomId(handshakeId);

    const input = new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
            .setLabel("code")
            .setCustomId("code")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
    );

    modal.addComponents(input);

    await command.showModal(modal);

    const collector = new InteractionCollector(command.client, {
        filter: (i) => i.customId == handshakeId,
    });

    collector.on("collect", async (modalData: ModalSubmitInteraction) => {
        const code = modalData.fields.getTextInputValue("code");

        await modalData.deferReply();

        try {
            const result = eval(code);

            modalData.editReply({
                embeds: [generateSuccessEmbed(util.inspect(result, { depth: -1 }))],
            });
        } catch (e) {
            command.editReply({
                embeds: [
                    generateErrorEmbed(`\`\`\`bash\n${truncateString(String(e), 2030)}\`\`\``),
                ],
            });
        }
    });
});

export default evalCommand;
