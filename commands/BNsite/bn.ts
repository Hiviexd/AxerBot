import { SlashCommand } from "../../models/commands/SlashCommand";
import bnInfo from "./subcommands/bn/bnInfo";

const bn = new SlashCommand(["bn", "nat"], "BN website commands", "BN website", true, {
    note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
});

bn.addSubcommand(bnInfo);

export default bn;
