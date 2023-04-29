import {
    ActionRowBuilder,
    ColorResolvable,
    ComponentType,
    EmbedBuilder,
    InteractionCollector,
    InteractionType,
    ModalBuilder,
    ModalSubmitInteraction,
    RoleSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { randomBytes } from "crypto";
import colors from "../../../../constants/colors";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";

const newSelectRole = new SlashCommandSubcommand(
    "new",
    "Create a new roles selector",
    undefined,
    ["ManageMessages", "ModerateMembers"],
    true
);

newSelectRole.setExecuteFunction(async (command) => {
    const handshakeId = randomBytes(10).toString("hex");

    const embedTitle = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Title")
            .setCustomId("title")
            .setStyle(TextInputStyle.Short)
            .setValue("📌 Cool member roles")
            .setRequired(false)
    );

    const embedContent = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Content")
            .setCustomId("content")
            .setStyle(TextInputStyle.Paragraph)
            .setValue("Select your cool roles below! (Only for cool users)")
            .setRequired(true)
    );

    const embedColor = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Color")
            .setCustomId("color")
            .setValue(colors.pink as string)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
    );

    const embedImageCover =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Cover")
                .setCustomId("cover")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
        );

    const embedImageThumbnail =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Thumbnail")
                .setCustomId("thumbnail")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
        );

    const modal = new ModalBuilder()
        .setTitle("New Select Menu")
        .setCustomId(`${handshakeId},modal`)
        .setComponents(
            embedTitle,
            embedContent,
            embedColor,
            embedImageThumbnail,
            embedImageCover
        );

    await command.showModal(modal);

    const collector = new InteractionCollector(command.client, {
        filter: (i) => i.customId == `${handshakeId},modal`,
        interactionType: InteractionType.ModalSubmit,
    });

    collector.on("collect", handleModalEmbed);

    const entry = {
        embed: new EmbedBuilder(),
    };

    async function handleModalEmbed(interaction: ModalSubmitInteraction) {
        await interaction.deferUpdate();

        const title = interaction.fields.getTextInputValue("title");
        const content = interaction.fields.getTextInputValue("content");
        const color = interaction.fields.getTextInputValue("color");
        const thumbnail = interaction.fields.getTextInputValue("thumbnail");
        const cover = interaction.fields.getTextInputValue("cover");

        const embed = new EmbedBuilder();

        // ? Check if the hex value is valid
        if (
            color &&
            color[0] == "#" &&
            color.slice(1).length == 6 &&
            !isNaN(Number(color.slice(1)))
        )
            embed.setColor((color as ColorResolvable) || colors.pink);

        embed.setTitle(title || null);
        embed.setDescription(content || null);
        embed.setThumbnail(thumbnail || null);
        embed.setImage(cover || null);

        entry.embed = embed;

        requestRolesToSave(interaction);
    }

    async function requestRolesToSave(interaction: ModalSubmitInteraction) {
        const rolesMenu = new RoleSelectMenuBuilder()
            .setPlaceholder("Select")
            .setMinValues(1)
            .setMaxValues(25);

        await command.followUp("test");

        const embed = generateStepEmbedWithChoices<string>(
            command,
            "Roles display",
            "Use the select menu below to select roles (max is 25)",
            rolesMenu,
            undefined,
            undefined,
            true
        ).then((roles) => {
            console.log(roles);
        });
    }
});

export default newSelectRole;
