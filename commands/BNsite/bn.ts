import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import bnInfo from "./subcommands/bn/bnInfo";
import setBnRules from "./subcommands/bn/bnRules";

const bn = new SlashCommand(["bn", "nat"], "BN website commands", "BN website", true, {
    note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
});

const commandGroupSET = new SlashCommandSubcommandGroup("set", "Set and configure some parameters");

commandGroupSET.addCommand(setBnRules);

bn.addSubcommand(bnInfo).addSubcommandGroup(commandGroupSET);

export default bn;
