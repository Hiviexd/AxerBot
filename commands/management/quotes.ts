import { PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import quotesToggle from "./subcommands/quotes/quotesToggle";
import quotesStatus from "./subcommands/quotes/quotesStatus";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import quotestSetType from "./subcommands/quotes/quotesSetType";
import quotesSetList from "./subcommands/quotes/quotesSetList";
import quotesSetChance from "./subcommands/quotes/quotesSetChance";
import quotesSetWord from "./subcommands/quotes/quotesSetWord";
import quotesBlockChannels from "./subcommands/quotes/quotesBlockChannels";
import quotesAllowChannels from "./subcommands/quotes/quotesAllowChannels";
import quotesAddWord from "./subcommands/quotes/quotesAddWord";

const quotes = new SlashCommand(
    "quotes",
    "Configure random quotes system",
    "Management",
    false,
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

quotes.addSubcommand(quotesToggle).addSubcommand(quotesStatus);

const commandGroupSET = new SlashCommandSubcommandGroup(
    "set",
    "Set some value to the system"
);

commandGroupSET
    .addCommand(quotestSetType)
    .addCommand(quotesSetList)
    .addCommand(quotesSetChance)
    .addCommand(quotesSetWord);

const commandGroupBLOCK = new SlashCommandSubcommandGroup(
    "block",
    "Block some value to the system"
);

commandGroupBLOCK.addCommand(quotesBlockChannels);

const commandGroupALLOW = new SlashCommandSubcommandGroup(
    "allow",
    "Allow some value to the system"
);

commandGroupALLOW.addCommand(quotesAllowChannels);

const commandGroupADD = new SlashCommandSubcommandGroup(
    "add",
    "Add some value to the system"
);

commandGroupADD.addCommand(quotesAddWord);

quotes
    .addSubcommandGroup(commandGroupSET)
    .addSubcommandGroup(commandGroupBLOCK)
    .addSubcommandGroup(commandGroupADD)
    .addSubcommandGroup(commandGroupALLOW);

export default quotes;
