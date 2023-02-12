import removeTrack from "./subcommands/tracker/removeTrack";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { PermissionFlagsBits } from "discord-api-types/v9";
import addTracker from "./subcommands/tracker/addTrack";
import info from "./subcommands/tracker/info";

const bntracker = new SlashCommand(
    "bntracker",
    "Track nominators' request status from the BN website",
    "BNSite",
    false,
    {
        syntax: "/bntrack <add|remove|status>",
    },
    [PermissionFlagsBits.ManageChannels]
);

bntracker.addSubcommand(removeTrack);
bntracker.addSubcommand(addTracker);
bntracker.addSubcommand(info);

export default bntracker;
