import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    InteractionCollector,
    Message,
    SelectMenuInteraction,
    StringSelectMenuBuilder,
    TextBasedChannelResolvable,
} from "discord.js";

import crypto from "crypto";
import { unlinkSync } from "fs";
import moment from "moment";
import path from "path";
import colors from "../../constants/colors";
import { getUserId } from "../../helpers/commands/getUserId";
import { validateArrayIndex } from "../../helpers/general/validateArrayIndex";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import generateWaitEmbed from "../../helpers/text/embeds/generateWaitEmbed";
import getBeatmapEmbedFields from "../../helpers/text/embeds/getBeatmapEmbedFields";
import generateColoredModeIcon from "../../helpers/text/generateColoredModeIcon";
import timeString from "../../helpers/text/timeString";
import { IBeatmapVideo, generateBeatmapVideo } from "../../helpers/video/generateBeatmapVideo";
import osuApi from "../../modules/osu/fetcher/osuApi";
import {
    BeatmapCalculationResult,
    calculateBeatmap,
} from "../../modules/osu/performance/calculateBeatmap";
import { Beatmapset } from "../../types/beatmap";
import { GameModeName } from "../../types/game_mode";

const mods = [
    { name: "EZ", emoji: "1071874648112910436" },
    { name: "NF", emoji: "1071874650801459220" },
    { name: "HT", emoji: "1071874652214931586" },
    { name: "HR", emoji: "1071874637799108719" },
    { name: "DT", emoji: "1071874639543943248" },
    { name: "HD", emoji: "1071874641804660757" },
    { name: "FL", emoji: "1071874645898309683" },
];

function getModsSelector(handshakeId: string, selectedMods: string[]) {
    const selector = new StringSelectMenuBuilder()
        .setCustomId(`${handshakeId}|mods|handlerIgnore`)
        .setPlaceholder("Mod selector")
        .setMinValues(0)
        .setMaxValues(5);

    for (const mod of mods) {
        selector.addOptions({
            label: mod.name,
            value: mod.name,
            emoji: mod.emoji,
            default: selectedMods.includes(mod.name),
        });
    }

    return selector;
}

function getModsEmojis(selected: string[]) {
    return selected
        .map((mod) => `<:${mod}:${mods.find((m) => m.name == mod)?.emoji}>`)
        .filter((m) => !m.includes("undefined"))
        .join("");
}

function getModeInt(mode: string) {
    const modes = ["osu", "taiko", "fruits", "mania"];

    const index = modes.findIndex((m) => m == mode);

    if (index == -1) return null;

    return index;
}

export default {
    delete: async (button: ButtonInteraction) => {
        const handshakeId = button.customId.split("|")[0];
        const senderUserId = button.customId.split("|")[1];
        const type = button.customId.split("|")[2];

        if (type != "deleteBeatmapEmbed" || senderUserId != button.user.id) return;

        button.message
            .delete()
            .then((msg) => {})
            .catch((e) => {
                console.error(e);
            });
    },
    send: async (
        beatmapset: Beatmapset,
        beatmap_id: string | null,
        mode: string,
        target: Message | ChatInputCommandInteraction,
        _mods?: string[],
        extraMenu?: StringSelectMenuBuilder
    ) => {
        try {
            if (!beatmapset.beatmaps) return;

            const handshakeId = crypto.randomUUID();
            let isWaitingVideo = false;
            let video: IBeatmapVideo | undefined | null;
            const extraButtonRow = new ActionRowBuilder<typeof extraMenu | any>();

            if (extraMenu) extraButtonRow.addComponents(extraMenu);

            generateBeatmapVideo(beatmapset)
                .then((data) => {
                    video = data;

                    if (isWaitingVideo) {
                        sendVideo();
                    }
                })
                .catch((e) => {
                    console.error(e);
                    video = null;
                });

            beatmapset.beatmaps.sort((a, b) => a.difficulty_rating - b.difficulty_rating);

            const backToDataEmbedButton = new ButtonBuilder()
                .setLabel("◀️ Back")
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`${handshakeId}|backToData|handlerIgnore`);

            const goToPreviewButton = new ButtonBuilder()
                .setLabel("📺 Preview")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${handshakeId}|goToVideo|handlerIgnore`);

            const deleteEmbedButton = new ButtonBuilder()
                .setLabel("🗑 Delete")
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`${handshakeId}|${target.member?.user.id}|deleteBeatmapEmbed`);

            function sendWaitingVideo() {
                const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
                    backToDataEmbedButton
                );

                const embed = generateWaitEmbed("Hold on!", "We're working on this preview");

                if ((target as ChatInputCommandInteraction).commandId) {
                    (target as ChatInputCommandInteraction)
                        .editReply({
                            embeds: [embed],
                            content: "",
                            components: [actionRow],
                            files: [],
                            allowedMentions: {
                                repliedUser: false,
                            },
                        })
                        .catch(console.error);
                } else {
                    target.reply({
                        embeds: [embed],
                        content: "",
                        files: [],
                        components: [actionRow],
                        allowedMentions: {
                            repliedUser: false,
                        },
                    });
                }
            }

            function sendVideo() {
                if (!video) return sendWaitingVideo();

                const attachment = new AttachmentBuilder(path.resolve(video.filePath), {
                    name: "Preview.mp4",
                });

                const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
                    backToDataEmbedButton
                );

                if ((target as ChatInputCommandInteraction).commandId) {
                    (target as ChatInputCommandInteraction)
                        .editReply({
                            files: [attachment],
                            content: "",
                            components: [actionRow],
                            allowedMentions: {
                                repliedUser: false,
                            },
                        })
                        .catch(console.error);
                } else {
                    target
                        .reply({
                            files: [attachment],
                            content: "",
                            components: [actionRow],
                            allowedMentions: {
                                repliedUser: false,
                            },
                        })
                        .catch(console.error);
                }
            }

            let mods = _mods ?? ["NM"];

            let selectedDifficultyIndex = beatmap_id
                ? validateArrayIndex(
                      beatmapset.beatmaps.findIndex((d) => d.id.toString() == beatmap_id)
                  )
                : 0;

            if (beatmapset.beatmaps[selectedDifficultyIndex].mode_int != 0)
                mode = beatmapset.beatmaps[selectedDifficultyIndex].mode;

            if (!mode) mode = beatmapset.beatmaps[selectedDifficultyIndex].mode;

            const embed = new EmbedBuilder();
            let modsSelector = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                getModsSelector(handshakeId, mods)
            );

            let beatmapDifficulty = calculateBeatmap(
                (await osuApi.fetch.osuFile(beatmapset.beatmaps[selectedDifficultyIndex].id)).data,
                getModeInt(mode) ?? beatmapset.beatmaps[selectedDifficultyIndex].mode_int,
                mods.join("")
            );

            const status_icons: any = {
                ranked: "https://media.discordapp.net/attachments/959908232736952420/961745250462883930/ranked.png",
                loved: "https://media.discordapp.net/attachments/959908232736952420/961745251096199209/loved.png",
                approved:
                    "https://media.discordapp.net/attachments/959908232736952420/961745250878099456/qualified.png",
                qualified:
                    "https://media.discordapp.net/attachments/959908232736952420/961745250878099456/qualified.png",
                pending:
                    "https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
                wip: "https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
                graveyard:
                    "https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
            };

            embed.setTitle(`${beatmapset.artist} - ${beatmapset.title}`);
            embed.setColor(colors.pink);
            embed.setURL(getURL());
            embed.setAuthor({
                name: `${beatmapset.status} beatmapset`,
                iconURL: status_icons[beatmapset.status],
            }),
                embed.setThumbnail(`https://b.ppy.sh/thumb/${beatmapset.id}l.jpg`);
            embed.setDescription(
                `⭐ **SR**: \`${beatmapDifficulty.difficulty.starRating.toFixed(
                    2
                )}\` | 🕒 **Duration**: \`${timeString(
                    beatmapset.beatmaps[selectedDifficultyIndex].total_length
                )}\` | 🎵 **BPM**: \`${getBPMString(beatmapDifficulty)}\` | **Mods**: ${
                    mods.includes("NM") ? "None" : getModsEmojis(mods)
                }`
            );
            embed.setFields(
                {
                    name: `${generateColoredModeIcon(
                        mode ?? beatmapset.beatmaps[selectedDifficultyIndex].mode,
                        beatmapDifficulty.difficulty.starRating
                    )} ${beatmapset.beatmaps[selectedDifficultyIndex].version}`,
                    value: getBeatmapEmbedFields(
                        beatmapset.beatmaps[selectedDifficultyIndex],
                        (mode as GameModeName) ?? beatmapset.beatmaps[selectedDifficultyIndex].mode,
                        beatmapDifficulty.beatmap,
                        beatmapDifficulty.difficulty
                    ),
                    inline: true,
                },
                {
                    name: "PP by Accuracy",
                    value: beatmapDifficulty.performance
                        .map((p) => `${p.acc}%: \`${p.pp}pp\``)
                        .join("\n"),
                    inline: true,
                }
            );
            embed.setFooter({
                text: `Mapped by ${await getDifficultyMapperName(
                    selectedDifficultyIndex
                )} | Last updated at ${moment(beatmapset.last_updated).fromNow()}`,
                iconURL: `https://a.ppy.sh/${beatmapset.beatmaps[selectedDifficultyIndex].user_id}`,
            });

            async function getDifficultyMapperName(index: number) {
                if (!beatmapset.beatmaps) return "Deleted User";

                const r = await osuApi.fetch.user(beatmapset.beatmaps[index].user_id.toString());

                if (r.status != 200 || !r.data) return "Deleted User";

                return r.data.username;
            }

            const embedButtonsRow = new ActionRowBuilder<ButtonBuilder>();
            const staticButtonsRow = new ActionRowBuilder<ButtonBuilder>();

            const staticMapperProfileButton = new ButtonBuilder()
                .setLabel("Mapper profile")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://osu.ppy.sh/users/${encodeURI(beatmapset.creator)}`);

            const staticOsuDirectButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("osu!direct")
                .setURL(
                    `https://axer-url.vercel.app/api/direct?map=${beatmapset.beatmaps[selectedDifficultyIndex].id}`
                );

            // const staticQuickDownloadButton = new ButtonBuilder({
            //     style: ButtonStyle.Secondary,
            //     customId: `beatmap_download|${beatmapset.id}`,
            //     label: "Download",
            //     emoji: "1070892493333344297",
            // });

            staticButtonsRow.addComponents(
                staticMapperProfileButton,
                staticOsuDirectButton,
                goToPreviewButton,
                deleteEmbedButton
            );

            let embedBackButton = new ButtonBuilder()
                .setLabel("◀️")
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`${handshakeId}|back|handlerIgnore`)
                .setDisabled(selectedDifficultyIndex == 0);

            let embedIndicatorButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`${handshakeId}|decorator`)
                .setLabel(`${selectedDifficultyIndex + 1} of ${beatmapset.beatmaps.length}`);

            let embedSkipButton = new ButtonBuilder()
                .setLabel("▶️")
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`${handshakeId}|skip|handlerIgnore`)
                .setDisabled(selectedDifficultyIndex + 1 == beatmapset.beatmaps.length);

            embedButtonsRow.setComponents(embedBackButton, embedIndicatorButton, embedSkipButton);

            function getBPMString(difficulty: BeatmapCalculationResult) {
                if (difficulty.beatmap.bpmMin == difficulty.beatmap.bpmMax)
                    return Math.round(difficulty.beatmap.bpmMax);

                function parseFloatError(value: number) {
                    if (
                        value.toString().split(".")[1] &&
                        value.toString().split(".")[1].length > 2
                    ) {
                        return Math.round(value);
                    }

                    if (value.toString().split(".").length != 0) return value.toFixed(0);

                    return value;
                }

                return `${parseFloatError(difficulty.beatmap.bpmMin)}/${parseFloatError(
                    difficulty.beatmap.bpmMax
                )}`;
            }

            /**
             * @returns Beatmap URL or Beatmapset URL
             */
            function getURL() {
                if (beatmap_id) return `https://osu.ppy.sh/b/${beatmap_id}`;

                return `https://osu.ppy.sh/s/${beatmapset.id}`;
            }

            async function selectDifficulty(
                sum: boolean,
                interaction?: ButtonInteraction | SelectMenuInteraction,
                refresh?: boolean
            ) {
                if (!beatmapset.beatmaps) return;

                if (!refresh) {
                    sum ? (selectedDifficultyIndex += 1) : (selectedDifficultyIndex -= 1);
                }

                beatmapDifficulty = calculateBeatmap(
                    (await osuApi.fetch.osuFile(beatmapset.beatmaps[selectedDifficultyIndex].id))
                        .data,
                    getModeInt(mode) ?? beatmapset.beatmaps[selectedDifficultyIndex].mode_int,
                    mods.join("")
                );

                new ActionRowBuilder().setComponents(getModsSelector(handshakeId, mods));

                embed.setDescription(
                    `⭐ **SR**: \`${beatmapDifficulty.difficulty.starRating.toFixed(
                        2
                    )}\` | 🕒 **Duration**: \`${timeString(
                        beatmapset.beatmaps[selectedDifficultyIndex].total_length
                    )}\` | 🎵 **BPM**: \`${getBPMString(beatmapDifficulty)}\` | **Mods**: ${
                        mods.includes("NM") ? "None" : getModsEmojis(mods)
                    }`
                );

                embed.setFields(
                    {
                        name: `${generateColoredModeIcon(
                            mode ?? beatmapset.beatmaps[selectedDifficultyIndex].mode,
                            beatmapDifficulty.difficulty.starRating
                        )} ${beatmapset.beatmaps[selectedDifficultyIndex].version}`,
                        value: getBeatmapEmbedFields(
                            beatmapset.beatmaps[selectedDifficultyIndex],
                            (mode as GameModeName) ??
                                beatmapset.beatmaps[selectedDifficultyIndex].mode,
                            beatmapDifficulty.beatmap,
                            beatmapDifficulty.difficulty
                        ),
                        inline: true,
                    },
                    {
                        name: "PP by Accuracy",
                        value: beatmapDifficulty.performance
                            .map((p) => `${p.acc}%: \`${p.pp}pp\``)
                            .join("\n"),
                        inline: true,
                    }
                );
                embed.setFooter({
                    text: `Mapped by ${await getDifficultyMapperName(
                        selectedDifficultyIndex
                    )} | Last updated at ${moment(beatmapset.last_updated).fromNow()}`,
                    iconURL: `https://a.ppy.sh/${beatmapset.beatmaps[selectedDifficultyIndex].user_id}`,
                });

                embedBackButton = new ButtonBuilder()
                    .setLabel("◀️")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`${handshakeId}|back|${crypto.randomUUID()}|handlerIgnore`)
                    .setDisabled(selectedDifficultyIndex == 0);

                embedIndicatorButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`${handshakeId}|decorator`)
                    .setLabel(`${selectedDifficultyIndex + 1} of ${beatmapset.beatmaps.length}`);

                embedSkipButton = new ButtonBuilder()
                    .setLabel("▶️")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`${handshakeId}|skip|${crypto.randomUUID()}|handlerIgnore`)
                    .setDisabled(selectedDifficultyIndex + 1 == beatmapset.beatmaps.length);

                embedButtonsRow.setComponents(
                    embedBackButton,
                    embedIndicatorButton,
                    embedSkipButton
                );

                if (interaction) {
                    const msg = interaction.message as Message;

                    msg.edit({
                        embeds: [embed],
                        content: "",
                        files: [],
                        components:
                            extraButtonRow.components.length > 0
                                ? [extraButtonRow, staticButtonsRow, embedButtonsRow]
                                : [modsSelector, staticButtonsRow, embedButtonsRow],
                        allowedMentions: {
                            repliedUser: false,
                        },
                    });
                }
            }

            const interactionCollector = new InteractionCollector(target.client, {
                channel: target.channel as TextBasedChannelResolvable,
                time: 300000,
                filter: (i: ButtonInteraction | SelectMenuInteraction) =>
                    i.user.id == getUserId(target),
            });

            interactionCollector.on("end", () => {
                if (!video) return;

                unlinkSync(video.filePath);
            });

            interactionCollector.on("collect", (interaction) => {
                if (!beatmapset.beatmaps) return;

                if (interaction.isButton()) {
                    const handshake = interaction.customId.split("|")[0];

                    if (handshake != handshakeId) return;

                    const action = interaction.customId.split("|")[1];

                    if (action == "goToVideo") {
                        if (isWaitingVideo) return sendWaitingVideo();

                        sendVideo();
                    }

                    if (action == "backToData") {
                        selectedDifficultyIndex -= 1;
                        selectDifficulty(true, interaction);
                    }

                    try {
                        interaction.deferUpdate();
                    } catch (e) {
                        void {};
                    }

                    if (
                        action == "skip" &&
                        selectedDifficultyIndex + 1 < beatmapset.beatmaps.length
                    )
                        return selectDifficulty(true, interaction);

                    if (action == "back" && selectedDifficultyIndex > 0)
                        return selectDifficulty(false, interaction);
                }

                if (interaction.isSelectMenu()) {
                    const handshake = interaction.customId.split("|")[0];

                    if (handshake != handshakeId) return;

                    try {
                        interaction.deferUpdate();
                    } catch (e) {
                        void {};
                    }

                    mods = interaction.values.length == 0 ? ["NM"] : interaction.values;

                    modsSelector = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                        getModsSelector(handshakeId, interaction.values)
                    );

                    selectDifficulty(true, interaction, true);
                }
            });

            if ((target as ChatInputCommandInteraction).commandId) {
                (target as ChatInputCommandInteraction)
                    .editReply({
                        embeds: [embed],
                        content: "",
                        files: [],
                        components:
                            extraButtonRow.components.length > 0
                                ? [extraButtonRow, staticButtonsRow, embedButtonsRow]
                                : [modsSelector, staticButtonsRow, embedButtonsRow],
                        allowedMentions: {
                            repliedUser: false,
                        },
                    })
                    .catch(console.error);
            } else {
                target
                    .reply({
                        embeds: [embed],
                        files: [],
                        content: "",
                        components:
                            extraButtonRow.components.length > 0
                                ? [extraButtonRow, staticButtonsRow, embedButtonsRow]
                                : [modsSelector, staticButtonsRow, embedButtonsRow],
                        allowedMentions: {
                            repliedUser: false,
                        },
                    })
                    .catch(console.error);
            }
        } catch (e) {
            console.error(e);

            if ((target as ChatInputCommandInteraction).commandId) {
                (target as ChatInputCommandInteraction)
                    .editReply({
                        embeds: [generateErrorEmbed("Something went wrong")],
                        content: "",
                        files: [],
                        components: [],
                        allowedMentions: {
                            repliedUser: false,
                        },
                    })
                    .catch(console.error);
            } else {
                target
                    .reply({
                        embeds: [generateErrorEmbed("Something went wrong")],
                        content: "",
                        files: [],
                        components: [],
                        allowedMentions: {
                            repliedUser: false,
                        },
                    })
                    .catch(console.error);
            }
        }
    },
};
