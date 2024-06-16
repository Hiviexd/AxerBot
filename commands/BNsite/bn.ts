import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import { bnInfo } from "./subcommands/bn/bnInfo";

const bn = new SlashCommand()
    .setName("bn")
    .setCategory(CommandCategory.BNSite)
    .setDescription("nat")
    .setDescription("Collection of BNSite commands");

bn.addSubcommand(bnInfo);

export { bn };
