import {
    ActionRowBuilder,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildResolvable,
    InteractionCollector,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextBasedChannel,
} from "discord.js";
import crypto from "crypto";
import colors from "../../constants/colors";

interface IStepWithMenuPromise {
    reason: "timeout" | "resolve";
    data: string[];
}

export async function generateStepEmbedWithChoices(
    command: CommandInteraction,
    title: string,
    description: string,
    selectMenu: StringSelectMenuBuilder,
    _embed?: EmbedBuilder
) {
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
                        text: "You have 1 minute to choose!",
                    });

            const collector = new InteractionCollector(command.client, {
                channel: command.channel as TextBasedChannel,
                guild: command.guild as GuildResolvable,
                time: 60000,
                filter: (i) => i.user.id == command.user.id,
                componentType: ComponentType.StringSelect,
            });

            selectMenu.setCustomId(handshakeId);

            collector.on(
                "collect",
                async (select: StringSelectMenuInteraction) => {
                    if (select.customId != handshakeId) return;
                    await select.deferUpdate();

                    command
                        .editReply({
                            content: "_Loading..._",
                            embeds: [],
                            components: [],
                        })
                        .then(() => {
                            resolve({
                                reason: "resolve",
                                data: select.values,
                            });

                            collector.stop("UserChoice");
                        });
                }
            );

            collector.on("end", (interactions, reason) => {
                if (reason != "UserChoice")
                    return reject({
                        reason: "timeout",
                        data: null,
                    });
            });

            const actionRow =
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                    selectMenu
                );

            command.editReply({
                embeds: [embed],
                components: [actionRow],
            });
        }
    );

    return promise;
}
