import { ChannelType } from "discord.js";

import { bot } from "../..";
import { tracks } from "../../database";
import { SendBeatmapDisqualifyEmbed } from "../../responses/mappertracker/SendBeatmapDisqualifyEmbed";
import { SendBeatmapNominationEmbed } from "../../responses/mappertracker/SendBeatmapNominationEmbed";
import { SendBeatmapNominationResetEmbed } from "../../responses/mappertracker/SendBeatmapNominationResetEmbed";
import { SendBeatmapQualifyEmbed } from "../../responses/mappertracker/SendBeatmapQualifyEmbed";
import { sendBeatmapRankedEmbed } from "../../responses/mappertracker/SendBeatmapRankedEmbed";
import { BeatmapsetEvent, BeatmapsetEventType } from "../../types/beatmap";
import { SendBeatmapsetMetadataEdit } from "../../responses/mappertracker/SendBeatmapsetMetadataEdit";
import { UserRecentEvent, UserRecentEventType } from "../../types/user";
import { parseOsuPathId } from "../../helpers/text/parseOsuPathId";
import { sendNewBeatmapEmbed } from "../../responses/mappertracker/SendNewBeatmapEmbed";
import { sendBeatmapReviveEmbed } from "../../responses/mappertracker/SendBeatmapReviveEmbed";
import { sendBeatmapUpdateEmbed } from "../../responses/mappertracker/SendBeatmapUpdateEmbed";

export async function handleMapperTrackerUserEvent(event: UserRecentEvent) {
    const trackersMatchingMapper = await tracks.find({
        userId: parseOsuPathId(event.user.url),
        type: "mapper",
        targetsArray: event.type,
    });

    for (const tracker of trackersMatchingMapper) {
        sendForTracker(tracker);
    }

    async function sendForTracker(tracker: (typeof trackersMatchingMapper)[0]) {
        if (!tracker.channel) return;

        const channel = await bot.channels.fetch(tracker.channel);

        if (
            !channel ||
            ![ChannelType.GuildAnnouncement, ChannelType.GuildText].includes(channel.type)
        )
            return;

        if (!channel.isTextBased()) return;

        const embed = getEventForEventType(event.type);

        if (!embed) return;

        embed(event, tracker);
    }

    function getEventForEventType(type: UserRecentEventType) {
        const embeds: { [key: string | symbol]: Function } = {
            beatmapsetRevive: sendBeatmapReviveEmbed,
            beatmapsetUpload: sendNewBeatmapEmbed,
            beatmapsetUpdate: sendBeatmapUpdateEmbed,
        };

        return embeds[type];
    }
}

export async function handleMapperTracker(event: BeatmapsetEvent) {
    const trackersMatchingMapper = await tracks.find({
        userId: event.beatmapset.user_id,
        type: "mapper",
        targetsArray: event.type,
    });

    for (const tracker of trackersMatchingMapper) {
        sendForTracker(tracker);
    }

    async function sendForTracker(tracker: (typeof trackersMatchingMapper)[0]) {
        if (!tracker.channel) return;

        const channel = await bot.channels.fetch(tracker.channel);

        if (
            !channel ||
            ![ChannelType.GuildAnnouncement, ChannelType.GuildText].includes(channel.type)
        )
            return;

        if (!channel.isTextBased()) return;

        const embed = getEventForEventType(event.type);

        if (!embed) return;

        embed(event, tracker);
    }

    function getEventForEventType(type: BeatmapsetEventType) {
        const embeds: { [key: string | symbol]: Function } = {
            nominate: SendBeatmapNominationEmbed,
            qualify: SendBeatmapQualifyEmbed,
            disqualify: SendBeatmapDisqualifyEmbed,
            nomination_reset: SendBeatmapNominationResetEmbed,
            nomination_reset_received: SendBeatmapNominationResetEmbed,
            rank: sendBeatmapRankedEmbed,
            genre_edit: SendBeatmapsetMetadataEdit,
            language_edit: SendBeatmapsetMetadataEdit,
            offset_edit: SendBeatmapsetMetadataEdit,
            tags_edit: SendBeatmapsetMetadataEdit,
            beatmap_owner_change: SendBeatmapsetMetadataEdit,
        };

        return embeds[type];
    }
}
