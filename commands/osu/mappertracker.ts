import { PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import mapperTrackerNewTracker from "./subcommands/maptracker/newTracker";
import mapperTrackerListTracker from "./subcommands/maptracker/listTracker";
import mapperTrackerRemoveTracker from "./subcommands/maptracker/removeTracker";

export enum MapperTrackerType {
    Nominate = "nominate",
    Qualify = "qualify",
    Disqualify = "disqualify",
    NominationReset = "nomination_reset",
    NominationResetRecive = "nomination_reset_received",
    Rank = "rank",
    GenreEdit = "genre_edit",
    LanguageEdit = "language_edit",
    OffsetEdit = "offset_edit",
    TagsEdit = "tags_edit",
    OwnerChange = "beatmap_owner_change",
    Revive = "beatmapsetRevive",
    Upload = "beatmapsetUpload",
    Update = "beatmapsetUpdate",
}

const mapperTracker = new SlashCommand(
    ["mappertracker", "maptracker"],
    "Track mapper beatmap events",
    "osu!",
    false,
    {
        "Which data can be tracked?": [
            "`User beatmap uploads`",
            "`User beatmap updates`",
            "`User new ranked/loved/disqualified beatmap`",
        ],
    },
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages]
);

mapperTracker
    .addSubcommand(mapperTrackerNewTracker)
    .addSubcommand(mapperTrackerListTracker)
    .addSubcommand(mapperTrackerRemoveTracker);

export default mapperTracker;
