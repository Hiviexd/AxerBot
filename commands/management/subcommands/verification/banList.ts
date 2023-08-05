import { randomUUID } from "crypto";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    InteractionCollector,
    PermissionFlagsBits,
} from "discord.js";
import moment from "moment";
import colors from "../../../../constants/colors";
import { guildUserAccountBans } from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationBanList = new SlashCommandSubcommand(
    "list",
    "List all restricted users here",
    undefined,
    [PermissionFlagsBits.BanMembers]
);

verificationBanList.setExecuteFunction(async (command) => {
    const bansList = await guildUserAccountBans
        .find({
            guildId: command.guildId,
        })
        .sort({ createdAt: 1 });

    const maxPerPage = 5;

    const allPages = bansList.reduce((all: any[], one, i) => {
        const ch = Math.floor(i / maxPerPage);
        all[ch] = ([] as typeof all).concat(all[ch] || [], one);
        return all;
    }, []) as [typeof bansList];

    if (bansList.length == 0)
        return command.editReply({
            embeds: [generateErrorEmbed("There's no restricted users here!")],
        });

    // indexes
    let currentPageIndex = 0;
    let allowPrevious = true;
    let allowNext = true;
    const maxPages = allPages.length;

    const handshakeId = randomUUID();

    // enums
    enum PaginationAction {
        Previous = "0",
        Next = "1",
    }

    makeEmbed(0, command);

    const interactionCollector = new InteractionCollector(command.client, {
        filter: (i) => i.user.id == command.user.id,
    });

    interactionCollector.on("collect", async (button) => {
        if (!button.isButton()) return;
        const targets = button.customId.split(",");

        if (targets[0] != handshakeId) return;

        await button.deferUpdate();

        if (
            ![PaginationAction.Previous.toString(), PaginationAction.Next.toString()].includes(
                targets[1]
            )
        )
            return;

        // Check if the action is valid
        if (targets[1] == PaginationAction.Next) {
            if (currentPageIndex + 1 > maxPages) return;

            currentPageIndex++;
        } else {
            if (currentPageIndex - 1 < 0) return;

            currentPageIndex--;
        }

        // Lock or unlock buttons
        if (currentPageIndex + 1 == maxPages) {
            allowNext = false;
        } else {
            allowNext = true;
        }

        if (currentPageIndex == 0) {
            allowPrevious = false;
        } else {
            allowPrevious = true;
        }

        interactionCollector.resetTimer();

        makeEmbed(currentPageIndex, button);
    });

    function makeButtons() {
        if (currentPageIndex == 0) {
            allowPrevious = false;
        }

        if (currentPageIndex + 1 == maxPages) {
            allowNext = false;
        }

        const previous = new ButtonBuilder()
            .setLabel("◀️ Previous")
            .setCustomId(`${handshakeId},${PaginationAction.Previous}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!allowPrevious);
        const display = new ButtonBuilder()
            .setLabel(`${currentPageIndex + 1} of ${maxPages}`)
            .setCustomId(`${handshakeId},null`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
        const next = new ButtonBuilder()
            .setLabel("Next ▶️")
            .setCustomId(`${handshakeId},${PaginationAction.Next}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!allowNext);

        return new ActionRowBuilder<ButtonBuilder>().setComponents(previous, display, next);
    }

    function makeEmbed(page: number, interaction: ChatInputCommandInteraction | ButtonInteraction) {
        const content = makeContentFor(page);

        const buttons = makeButtons();

        const embed = new EmbedBuilder()
            .setTitle(`🔐 Restricted users list`)
            .setDescription("Number | UserId | Author | Date\n\n".concat(content.content))
            .setColor(colors.gold);

        interaction.editReply({
            embeds: [embed],
            components: [buttons],
        });
    }

    function makeContentFor(page: number) {
        return {
            selectedPage: page,
            maxPages,
            content: allPages[page]
                .map(
                    (ban, index) =>
                        `**#${bansList.indexOf(ban) + 1} |** [${
                            ban.userId
                        }](https://osu.ppy.sh/users/${ban.userId}) | <@${
                            ban.authorId
                        }> | <t:${moment(ban.createdAt).format("X")}:f>\n${
                            ban.reason || "No reason provided..."
                        }`
                )
                .join("\n\n"),
        };
    }
});

export default verificationBanList;
