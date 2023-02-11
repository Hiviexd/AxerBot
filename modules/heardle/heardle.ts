import axios from "axios";
import {
    StringSelectMenuInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    AttachmentBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import { users, heardles } from "../../database";
import { consoleCheck, consoleLog } from "../../helpers/core/logger";
import relativeTime from "../../helpers/general/relativeTime";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import truncateString from "../../helpers/text/truncateString";
import { Beatmapset } from "../../types/beatmap";
import colors from "../../constants/colors";

export default async (input: StringSelectMenuInteraction) => {
    consoleLog(
        `heardle`,
        `Processing heardle for ${input.user.tag} (${input.user.id}) on ${input.guild?.name} (${input.guildId}) | ${input.customId}`
    );

    await input.deferUpdate();
    const heardleId = input.customId;

    const heardle = await heardles.findById(heardleId);

    if (!heardle) return input.followUp("This heardle has ended!");

    let validIndexes: number[] = heardle.indexes;
    let answer = heardle.answer;
    let attempts = 0;
    let time = new Date();
    let beatmaps: Beatmapset[] = [];
    let answerIndex = -1;
    let actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
    let attachment = new AttachmentBuilder(".", {
        name: "Cant_Load.mp3",
    });

    attempts++;

    const selected = input.values[0];

    consoleLog(
        `heardle`,
        `Processing heardle reply for ${input.user.tag} (${input.user.id}) on ${input.guild?.name} (${input.guildId}) | ${input.customId} ||| >> ${answer}`
    );

    if (selected == answer) {
        const embed = new EmbedBuilder()
            .setAuthor({
                name: input.user.username,
                iconURL: input.user.avatarURL() || "",
            })
            .setTitle(`✅ Correct answer!`)
            .addFields(
                {
                    name: "Beatmap",
                    value: `[${heardle.map.artist} - ${heardle.map.title}](https://osu.ppy.sh/s/${heardle.map.id})`,
                },
                {
                    name: "Attempts",
                    value: `${attempts}`,
                    inline: true,
                },
                {
                    name: "Time",
                    value: `${relativeTime(
                        new Date(),
                        new Date(heardle.date || new Date())
                    )}`,
                    inline: true,
                }
            )
            .setFooter({
                text: "Next map in 5 seconds...",
            })
            .setImage(heardle.map.covers["cover@2x"])
            .setColor(colors.green);

        await input.editReply({
            content: `<@${input.user.id}> Loading next map...`,
            embeds: [embed],
            components: [],
            files: [],
        });

        setTimeout(async () => {
            if (heardle.played == 25) {
                await updateLevel();
            } else {
                heardle.played += 1;
                sendNextHeardle();
            }

            attempts = 0;
        }, 5000);

        return consoleCheck(
            `heardle`,
            `Heardle reply for ${input.user.tag} (${input.user.id}) on ${input.guild?.name} (${input.guildId}) | ${input.customId} ||| >> ${answer}`
        );
    }
    async function updateLevel() {
        consoleLog(
            `heardle`,
            `Updating heardle level for ${input.user.tag} (${input.user.id}) on ${input.guild?.name} (${input.guildId}) | ${input.customId}`
        );

        if (!heardle) return;

        input.editReply({ components: [] });

        const level = heardle.difficulty + 1;
        validIndexes = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19, 20, 21, 22, 23, 24,
        ];

        const b = await osuApi.fetch.featuredBeatmapsets(level);

        if (b.status != 200 || !b.data) {
            updateLevel();
            return [];
        }

        b.data.beatmapsets.splice(25, 999);

        beatmaps = b.data.beatmapsets;

        const beatmapTitleSelection = new StringSelectMenuBuilder().setCustomId(
            heardleId
        );

        const sortedBeatmaps = getBeatmapNames(
            beatmapTitleSelection,
            b.data.beatmapsets
        );

        answerIndex =
            validIndexes[Math.floor(Math.random() * validIndexes.length)];

        if (!sortedBeatmaps[answerIndex]) answerIndex = validIndexes[0];

        answer = sortedBeatmaps[answerIndex].title;

        actionRow =
            new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                beatmapTitleSelection
            );

        attachment = await getAudio(sortedBeatmaps[answerIndex].id);

        validIndexes = validIndexes.filter((i) => i != answerIndex);
        heardle.difficulty += 1;
        heardle.played = 1;
        heardle.indexes = validIndexes;
        heardle.beatmaps = beatmaps.map((b) => {
            const _map = {};

            Object.assign(_map, {
                id: b.id,
                title: b.title,
                artist: b.artist,
                covers: b.covers,
            });

            return _map;
        });

        heardle.map = {
            id: sortedBeatmaps[answerIndex].id,
            title: sortedBeatmaps[answerIndex].title,
            artist: sortedBeatmaps[answerIndex].artist,
            covers: sortedBeatmaps[answerIndex].covers,
        };
        heardle.answer = answer;

        time = new Date();

        heardle.date = time;

        await heardles.findByIdAndUpdate(heardle._id, heardle);

        await input.editReply({
            content: `**Song**: ${heardle.played}/25\n**Level**: ${heardle.difficulty}`,
            components: [actionRow],
            embeds: [],
            files: [attachment],
        });

        consoleCheck(
            `heardle`,
            `Heardle level for ${input.user.tag} (${input.user.id}) on ${
                input.guild?.name
            } (${input.guildId}) | ${input.customId} || updated! (${
                heardle.difficulty - 1
            } -> ${heardle.difficulty})`
        );

        return sortedBeatmaps;
    }

    async function sendNextHeardle() {
        consoleLog(
            `heardle`,
            `Sending new heardle song for ${input.user.tag} (${input.user.id}) on ${input.guild?.name} (${input.guildId}) | ${input.customId}`
        );

        if (!heardle) return input.followUp("This heardle has ended!");

        const beatmapTitleSelection = new StringSelectMenuBuilder().setCustomId(
            heardleId
        );

        const sortedBeatmaps = getBeatmapNames(beatmapTitleSelection);

        answerIndex =
            validIndexes[Math.floor(Math.random() * validIndexes.length)];

        if (!sortedBeatmaps[answerIndex]) answerIndex = validIndexes[0];

        const b = sortedBeatmaps[answerIndex];
        answer = sortedBeatmaps[answerIndex].title;
        let actionRow =
            new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                beatmapTitleSelection
            );

        heardle.answer = answer;
        heardle.map = {
            id: sortedBeatmaps[answerIndex].id,
            title: sortedBeatmaps[answerIndex].title,
            artist: sortedBeatmaps[answerIndex].artist,
            covers: sortedBeatmaps[answerIndex].covers,
        };

        let attachment = await getAudio(sortedBeatmaps[answerIndex].id);

        time = new Date();

        validIndexes = heardle.indexes.filter((i: number) => i != answerIndex);
        heardle.indexes = validIndexes;
        heardle.date = new Date();

        if (heardle.beatmaps.length == 0) {
            heardle.difficulty++;
            validIndexes = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                18, 19, 20, 21, 22, 23, 24,
            ];
        }

        await heardles.findByIdAndUpdate(heardle._id, heardle);

        await input.editReply({
            content: `**Song**: ${heardle.played}/25\n**Level**: ${heardle.difficulty}`,
            components: [actionRow],
            embeds: [],
            files: [attachment],
        });

        consoleCheck(
            `heardle`,
            `Heardle song for ${input.user.tag} (${input.user.id}) on ${input.guild?.name} (${input.guildId}) | ${input.customId} || updated!`
        );

        return b;
    }

    async function getAudio(id: number) {
        try {
            const buffer = await axios(`https://b.ppy.sh/preview/${id}.mp3`, {
                responseType: "arraybuffer",
                headers: {
                    accept: "audio/mp3",
                },
            });

            const attachment = new AttachmentBuilder(Buffer.from(buffer.data), {
                name: "Heardle.mp3",
            });

            return attachment;
        } catch (e) {
            input.editReply(
                "osu! website sucks, i can't load the beatmap preview. Please, start a new section."
            );

            return new AttachmentBuilder(".", {
                name: "osu_website_response.mp3",
            });
        }
    }

    function getBeatmapNames(
        menu: StringSelectMenuBuilder,
        beatmaps?: Beatmapset[]
    ) {
        if (!heardle) {
            input.followUp("This heardle has ended!");
            return [];
        }

        const sortedMaps: Beatmapset[] = beatmaps || heardle.beatmaps;

        sortedMaps.sort((a, b) => {
            if (a.title.toLowerCase() < b.title.toLowerCase()) {
                return -1;
            }
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
                return 1;
            }

            return 0;
        });

        menu.setOptions();
        sortedMaps.forEach((map) => {
            menu.addOptions({
                label: truncateString(`${map.title} - ${map.artist}`, 100),
                value: map.title,
            });
        });

        return sortedMaps;
    }
};
