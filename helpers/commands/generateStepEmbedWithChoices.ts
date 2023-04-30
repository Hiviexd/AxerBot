import {
    ActionRowBuilder,
    AnySelectMenuInteraction,
    ChannelSelectMenuBuilder,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildResolvable,
    InteractionCollector,
    InteractionType,
    ModalSubmitInteraction,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextBasedChannel,
    UserSelectMenuBuilder,
} from "discord.js";
import crypto from "crypto";
import colors from "../../constants/colors";

export async function generateStepEmbedWithChoices<T = string[]>(
    command: CommandInteraction | ModalSubmitInteraction,
    title: string,
    description: string,
    selectMenu:
        | StringSelectMenuBuilder
        | RoleSelectMenuBuilder
        | UserSelectMenuBuilder
        | ChannelSelectMenuBuilder,
    _embed?: EmbedBuilder,
    removeContent?: boolean,
    useFollowUp?: boolean
) {
    interface IStepWithMenuPromise {
        reason: "timeout" | "resolve";
        data: T;
    }

    return new Promise((resolve, reject) => {
        const handshakeId = crypto.randomUUID();

        const embed =
            _embed ??
            new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(colors.yellow)
                .setFooter({
                    text: "You have 1 minute to choose!",
                });

        const collector = new InteractionCollector(command.client, {
            channel: command.channel as TextBasedChannel,
            guild: command.guild as GuildResolvable,
            time: 60000,
            filter: (i) =>
                i.user.id == command.user.id &&
                i.type == InteractionType.MessageComponent &&
                i.componentType == selectMenu.data.type,
        });

        selectMenu.setCustomId(handshakeId);

        collector.on("collect", async (select: AnySelectMenuInteraction) => {
            if (select.customId != handshakeId) return;
            await select.deferUpdate();

            if (useFollowUp) {
                command
                    .followUp({
                        content: "_Loading..._",
                        embeds: [],
                        components: [],
                    })
                    .then(() => {
                        collector.stop("UserChoice");

                        resolve({
                            reason: "resolve",
                            data: select.values as any,
                        });
                    });
            } else {
                command
                    .editReply({
                        content: "_Loading..._",
                        embeds: [],
                        components: [],
                    })
                    .then(() => {
                        collector.stop("UserChoice");

                        resolve({
                            reason: "resolve",
                            data: select.values as any,
                        });
                    });
            }
        });

        collector.on("end", (interactions, reason) => {
            if (reason != "UserChoice")
                return reject({
                    reason: "timeout",
                    data: null,
                });
        });

        const actionRow = new ActionRowBuilder<
            typeof selectMenu
        >().addComponents(selectMenu);

        if (useFollowUp) {
            command.followUp(
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
        } else {
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
    }) as Promise<IStepWithMenuPromise>;
}
