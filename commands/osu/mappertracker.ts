import { SlashCommand } from "../../models/commands/SlashCommand";
import { mapperTrackerNewTracker } from "./subcommands/maptracker/newTracker";
import { mapperTrackerListTracker } from "./subcommands/maptracker/listTracker";
import { mapperTrackerRemoveTracker } from "./subcommands/maptracker/removeTracker";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const mapperTracker = new SlashCommand()
    .setName("mappertracker")
    .setDescription("Track mapper beatmap events")
    .setCategory(CommandCategory.Osu)
    .setPermissions("ManageChannels", "ManageMessages")
    .setHelp({
        "Which data can be tracked?": [
            "`User beatmap uploads`",
            "`User beatmap updates`",
            "`User new ranked/loved/disqualified beatmap`",
        ],
    })
    .addSubcommand(mapperTrackerNewTracker)
    .addSubcommand(mapperTrackerListTracker)
    .addSubcommand(mapperTrackerRemoveTracker);

export { mapperTracker };
