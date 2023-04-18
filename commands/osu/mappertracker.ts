import { PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import mapperTrackerNewTracker from "./subcommands/maptracker/newTracker";
import mapperTrackerListTracker from "./subcommands/maptracker/listTracker";
import mapperTrackerRemoveTracker from "./subcommands/maptracker/removeTracker";

export enum MapperTrackerType {
    BeatmapFavorite = "favorite",
    BeatmapRevive = "revive",
    NewHype = "hype",
    NewBeatmap = "new",
    RankedBeatmap = "ranked",
    QualifiedBeatmap = "qualify",
    DisqualifiedBeatmap = "dq",
    BeatmapNomination = "nom",
    BeatmapLoved = "loved",
    BeatmapGraveyard = "graveyard",
}

const mapperTracker = new SlashCommand(
    ["mapperTracker", "maptracker"],
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
