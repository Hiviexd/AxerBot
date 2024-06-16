import { SlashCommand } from "../../models/commands/SlashCommand";
import { userlogAddLog } from "./subcommands/userLog/addLog";
import { userlogList } from "./subcommands/userLog/list";
import { userlogRemoveLog } from "./subcommands/userLog/remove";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const userlog = new SlashCommand()
    .setName("userlog")
    .setDescription("Logs info about an user")
    .setCategory(CommandCategory.Management)
    .setPermissions("ModerateMembers")
    .addSubcommands(userlogAddLog, userlogRemoveLog, userlogList);

export { userlog };
