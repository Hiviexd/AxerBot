import {
    ChannelType,
    GuildChannelResolvable,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
} from "discord.js";
import { SlashCommandSubcommand } from "../../../models/commands/SlashCommandSubcommand";
import osuApi from "../../../helpers/osu/fetcher/osuApi";
import UserNotFound from "../../../responses/embeds/UserNotFound";
import generateErrorEmbedWithTitle from "../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { generateStepEmbedWithChoices } from "../../../helpers/commands/generateStepEmbedWithChoices";
import crypto from "crypto";
import { tracks } from "../../../database";
import generateSuccessEmbed from "../../../helpers/text/embeds/generateSuccessEmbed";
import { MapperTrackerType } from "../mappertracker";

const mappertrackerNewTracker = new SlashCommandSubcommand(
    "new",
    "Create a new mapper tracker",
    false,
    undefined,
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages]
);

mappertrackerNewTracker.builder
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

mappertrackerNewTracker.setExecuteFunction(async (command) => {
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
                label: "New Hype",
                value: MapperTrackerType.NewHype,
            },
            {
                label: "Beatmap Revive",
                value: MapperTrackerType.BeatmapRevive,
            },
            {
                label: "Beatmap Ranked",
                value: MapperTrackerType.RankedBeatmap,
            },
            {
                label: "Beatmap Nomination",
                value: MapperTrackerType.BeatmapNomination,
            },
            {
                label: "Beatmap Qualified",
                value: MapperTrackerType.QualifiedBeatmap,
            },
            {
                label: "Beatmap Disqualify",
                value: MapperTrackerType.DisqualifiedBeatmap,
            },
            {
                label: "Beatmap Loved",
                value: MapperTrackerType.BeatmapLoved,
            },
            {
                label: "Beatmap Graveyard",
                value: MapperTrackerType.BeatmapGraveyard,
            }
        )
        .setMinValues(1);
    selectMenu.setMaxValues(selectMenu.options.length);

    generateStepEmbedWithChoices(
        command,
        "📑 Select data to track",
        "Please select one of the options below",
        selectMenu
    ).then((values) => {
        if (!values.data) return;
        createTracker(values.data);
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
            embeds: [generateSuccessEmbed("Tracker created!")],
        });
    }
});

export default mappertrackerNewTracker;
