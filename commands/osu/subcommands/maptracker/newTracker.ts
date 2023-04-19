import {
    ChannelType,
    GuildChannelResolvable,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
} from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import UserNotFound from "../../../../responses/embeds/UserNotFound";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import crypto from "crypto";
import { tracks } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { MapperTrackerType } from "../../mappertracker";
import { BeatmapsetEventType } from "../../../../types/beatmap";
import { UserRecentEventType } from "../../../../types/user";

const mapperTrackerNewTracker = new SlashCommandSubcommand(
    "new",
    "Create a new mapper tracker",
    undefined,
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages]
);

mapperTrackerNewTracker.builder
    .addStringOption((o) =>
        o.setName("mapper").setDescription("Mapper username").setRequired(true)
    )
    .addChannelOption((o) =>
        o
            .setName("channel")
            .setDescription("Channel to announce the system")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    );

mapperTrackerNewTracker.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    const mapperUsername = command.options.getString("mapper", true);
    const channel = command.options.getChannel("channel", true);

    const mapperProfile = await osuApi.fetch.user(mapperUsername);

    if (mapperProfile.status != 200 || !mapperProfile.data)
        return command.editReply({
            embeds: [UserNotFound],
        });

    const botMember = command.guild.members.cache.get(command.client.user.id);

    if (
        !botMember ||
        !botMember
            .permissionsIn(channel as GuildChannelResolvable)
            .has(PermissionFlagsBits.SendMessages)
    )
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❌ Invalid channel!",
                    "I don't have permissions to send messages on that channel!"
                ),
            ],
        });

    const trackerCheck = await tracks.find({
        guild: command.guildId,
        type: "mapper",
    });

    if (trackerCheck.length == 25)
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❌ Tracker limit reached!",
                    "You can't add more than 25 trackers!"
                ),
            ],
        });

    const selectMenu = new StringSelectMenuBuilder()
        .setOptions(
            {
                label: "New Beatmap",
                value: MapperTrackerType.NewBeatmap,
            },
            {
                label: "Beatmap Update Upload",
                value: UserRecentEventType.BeatmapsetUpdate,
            },
            {
                label: "Beatmap Revive",
                value: UserRecentEventType.BeatmapsetRevive,
            },
            {
                label: "Beatmap Ranked",
                value: BeatmapsetEventType.RANK,
            },
            {
                label: "Beatmap Nomination",
                value: BeatmapsetEventType.NOMINATE,
            },
            {
                label: "Beatmap Qualified",
                value: BeatmapsetEventType.QUALIFY,
            },
            {
                label: "Beatmap Disqualify",
                value: BeatmapsetEventType.DISQUALIFY,
            },
            {
                label: "Beatmap Loved",
                value: BeatmapsetEventType.LOVE,
            },
            {
                label: "Beatmap Graveyard",
                value: MapperTrackerType.BeatmapGraveyard,
            },
            {
                label: "Beatmapset Tags Edit",
                value: BeatmapsetEventType.TAGS_EDIT,
            },
            {
                label: "Beatmapset Genre Edit",
                value: BeatmapsetEventType.GENRE_EDIT,
            },
            {
                label: "Beatmapset Language Edit",
                value: BeatmapsetEventType.LANGUAGE_EDIT,
            },
            {
                label: "Beatmap Owner Change",
                value: BeatmapsetEventType.BEATMAP_OWNER_CHANGE,
            },
            {
                label: "Beatmapset Timing Offset Edit",
                value: BeatmapsetEventType.OFFSET_EDIT,
            }
        )
        .setMinValues(1);
    selectMenu.setMaxValues(selectMenu.options.length);

    generateStepEmbedWithChoices(
        command,
        "📑 Select data to track",
        "Please select one of the options below",
        selectMenu
    )
        .then((values) => {
            if (!values.data) return;
            createTracker(values.data);
        })
        .catch((e) => {
            return command.editReply({
                content: "",
                embeds: [
                    generateErrorEmbed(
                        "Don't leave me waiting here! Please, do your things during the correct time."
                    ),
                ],
            });
        });

    async function createTracker(targets: string[]) {
        const trackerId = crypto.randomBytes(15).toString("hex");

        await tracks.create({
            _id: trackerId,
            channel: channel.id,
            guild: command.guild?.id,
            targetsArray: targets,
            type: "mapper",
            userId: mapperProfile.data.id,
        });

        command.editReply({
            content: "",
            embeds: [generateSuccessEmbed("Tracker created!")],
        });
    }
});

export default mapperTrackerNewTracker;
