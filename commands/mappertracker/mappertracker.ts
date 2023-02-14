import { PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import mappertrackerNewTracker from "./subcommands/newTracker";
import mappertrackerListTracker from "./subcommands/listTracker";
import mappertrackerRemoveTracker from "./subcommands/removeTracker";

export enum MapperTrackerType {
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

const mappertracker = new SlashCommand(
    ["maptracker", "mappertracker"],
    "Track mapper beatmap events",
    "MapperTracker",
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

mappertracker
    .addSubcommand(mappertrackerNewTracker)
    .addSubcommand(mappertrackerListTracker)
    .addSubcommand(mappertrackerRemoveTracker);

export default mappertracker;
