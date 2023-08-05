import {
    InteractionCollector,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { bnRules, users } from "../../../../database";
import qatApi from "../../../../helpers/qat/fetcher/qatApi";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateWaitEmbed from "../../../../helpers/text/embeds/generateWaitEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import checkCommandPlayers from "../../../../modules/osu/player/checkCommandPlayers";
import { sendAccountValidation } from "../../../../modules/verification/client/sendAccountValidation";
import UserNotFound from "../../../../responses/embeds/UserNotFound";
import BNEmbed from "../../../../responses/qat/BNEmbed";
import UserNotBNorNAT from "../../../../responses/qat/UserNotBNorNAT";
import { randomUUID } from "crypto";
import { ActionRowBuilder } from "@discordjs/builders";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import colors from "../../../../constants/colors";

const setBnRules = new SlashCommandSubcommand(
    "rules",
    "Set BN Tracker rules when you open using bnsite",
    undefined,
    [],
    true,
    true
);

setBnRules.setExecuteFunction(async (command) => {
    const userObject = await users.findById(command.user.id);

    if (!userObject)
        return command.reply({
            embeds: [
                generateErrorEmbed(
                    "You're not validated into database! Please, try again in some seconds."
                ),
            ],
        });

    if (!userObject.verified_id) {
        await command.reply("Your account isn't validated! Check below how to validate it.");
        return await sendAccountValidation(command);
    }

    const isBn = await qatApi.fetch.user(userObject.verified_id as number);

    // if (
    //     !isBn.data ||
    //     isBn.status != 200 ||
    //     !isBn.data.groups.find((g) => ["bn", "nat"].includes(g))
    // )
    //     return command.reply({
    //         embeds: [UserNotBNorNAT],
    //     });

    let currentRule = await bnRules.findById(userObject.verified_id);

    if (!currentRule) {
        currentRule = await bnRules.create({
            _id: userObject.verified_id,
            content: "",
            colour: colors.pink,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    const handshakeId = randomUUID();
    const modal = new ModalBuilder()
        .setTitle("BN Rules")
        .setCustomId(handshakeId)
        .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                    .setLabel("Rules")
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(2048)
                    .setRequired(true)
                    .setCustomId("rule")
                    .setValue(currentRule.content || "")
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                    .setLabel("Embed Colour")
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(7)
                    .setMinLength(7)
                    .setRequired(true)
                    .setCustomId("colour")
                    .setValue(currentRule.colour || (colors.pink as string))
            )
        );

    await command.showModal(modal);

    const modalInteraction = new InteractionCollector(command.client, {
        filter: (i) => i.customId == handshakeId,
        time: 300000,
    });

    modalInteraction.on("collect", async (form: ModalSubmitInteraction) => {
        if (form.customId != handshakeId) return;
        await form.deferReply();

        const newRules = form.fields.getTextInputValue("rule");
        const newColour = form.fields.getTextInputValue("colour");
        const sanitizedRules = newRules.toString().trim();

        if (!sanitizedRules) {
            form.editReply({
                embeds: [generateErrorEmbed("Invalid content!")],
            });

            return;
        }

        // Check if the input is a valid hex color input
        const hexValueRegExp = /^#([0-9a-f]{3}){1,2}$/i;

        if (!hexValueRegExp.test(newColour.toUpperCase())) {
            form.editReply({
                embeds: [generateErrorEmbed("Invalid colour! It should be HEX format: `#aabbcc`")],
            });

            return;
        }

        if (currentRule) {
            currentRule.content = sanitizedRules;
            currentRule.updatedAt = new Date();
            currentRule.colour = newColour;

            await currentRule.save();

            modalInteraction.stop();

            form.editReply({
                embeds: [generateSuccessEmbed("Rules updated!")],
            });
        }
    });
});

export default setBnRules;
