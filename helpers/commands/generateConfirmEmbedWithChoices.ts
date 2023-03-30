import {
    ActionRowBuilder,
    AnySelectMenuInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildResolvable,
    InteractionCollector,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextBasedChannel,
    UserSelectMenuBuilder,
} from "discord.js";
import crypto from "crypto";
import colors from "../../constants/colors";
import generateWaitEmbed from "../text/embeds/generateWaitEmbed";

export async function generateConfirmEmbedWithChoices(
    command: CommandInteraction,
    title: string,
    description: string,
    options: { label: string; callback: Function; type: ButtonStyle }[],
    confirmCallback: Function,
    _embed?: EmbedBuilder,
    showCancel?: boolean,
    removeContent?: boolean
) {
    interface IStepWithMenuPromise {
        reason: "timeout" | "resolve";
        data: string;
    }

    const promise: Promise<IStepWithMenuPromise> = new Promise(
        (resolve, reject) => {
            const handshakeId = crypto.randomUUID();

            const embed =
                _embed ??
                new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor(colors.yellow)
                    .setFooter({
                        text: "You have 1 minute to confirm!",
                    });

            const confirmButton = new ButtonBuilder()
                .setCustomId(handshakeId.concat(",confirm"))
                .setLabel("✅ Confirm")
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId(handshakeId.concat(",cancel"))
                .setLabel("❌ Cancel")
                .setStyle(ButtonStyle.Danger);

            const collector = new InteractionCollector(command.client, {
                channel: command.channel as TextBasedChannel,
                guild: command.guild as GuildResolvable,
                time: 60000,
                filter: (i) => i.user.id == command.user.id,
                componentType: ComponentType.Button,
            });

            collector.on("collect", async (button: ButtonInteraction) => {
                const handshake = button.customId.split(",")[0].trim();

                if (handshake != handshakeId)
                    return console.log("invalid handshake");
                await button.deferUpdate();

                const action = button.customId.split(",").pop()?.trim();

                if (action == "confirm") {
                    collector.stop("UserChoice");
                    return confirmCallback();
                }
                if (action == "cancel" && showCancel) {
                    collector.stop("UserChoice");

                    return command.editReply({
                        embeds: [generateWaitEmbed("Ok", "Job cancellated")],
                    });
                }

                command
                    .editReply({
                        content: "_Loading..._",
                        embeds: [],
                        components: [],
                    })
                    .then(() => {
                        const option = options.find((o) => o.label == action);

                        if (!option)
                            return reject({
                                reason: "error",
                                data: "Callback not found!",
                            });

                        option.callback(action);

                        collector.stop("UserChoice");
                        resolve({
                            reason: "resolve",
                            data: action as string,
                        });
                    });
            });

            collector.on("end", (interactions, reason) => {
                if (reason != "UserChoice")
                    return reject({
                        reason: "timeout",
                        data: null,
                    });
            });

            const actionRow =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    confirmButton
                );

            if (showCancel) {
                actionRow.addComponents(cancelButton);
            }

            options.forEach((o) => {
                actionRow.addComponents(
                    new ButtonBuilder()
                        .setLabel(o.label)
                        .setCustomId(handshakeId.concat(`,${o.label}`))
                        .setStyle(o.type)
                );
            });

            command.editReply(
                removeContent
                    ? {
                          content: "",
                          embeds: [embed],
                          components: [actionRow],
                      }
                    : {
                          embeds: [embed],
                          components: [actionRow],
                      }
            );
        }
    );

    return promise;
}
