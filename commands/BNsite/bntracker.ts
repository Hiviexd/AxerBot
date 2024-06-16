import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import { bntrackerAddTracker } from "./subcommands/tracker/bntrackerAddTracker";
import { bntrackerListTrackers } from "./subcommands/tracker/bntrackerListTrackers";
import { bntrackerRemoveTracker } from "./subcommands/tracker/bntrackerRemoveTracker";

const bntracker = new SlashCommand()
    .setName("bntracker")
    .setDescription("Track nominators' request status from the BN website")
    .setPermissions("ManageChannels")
    .setCategory(CommandCategory.BNSite)
    .setHelp({
        syntax: "/bntrack <add|remove|status>",
    })
    .addSubcommand(bntrackerAddTracker)
    .addSubcommand(bntrackerRemoveTracker)
    .addSubcommand(bntrackerListTrackers);

export { bntracker };
