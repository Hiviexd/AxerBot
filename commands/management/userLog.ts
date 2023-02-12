import { PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import userlogAddLog from "./subcommands/userLog/addLog";
import userlogList from "./subcommands/userLog/list";
import userlogRemoveLog from "./subcommands/userLog/remove";

const userlog = new SlashCommand(
    "userlog",
    "logs info about a user",
    "management",
    false,
    {
        description: "logs info about a user",
        syntax: "/userlog `<add/remove/list>` `<user>` `<reason>`",
        example: "/userlog `add` `@user` `reason`",
        options: ["`add`", "`remove`", "`list`"],
    },
    [PermissionFlagsBits.ModerateMembers]
);

userlog
    .addSubcommand(userlogAddLog)
    .addSubcommand(userlogRemoveLog)
    .addSubcommand(userlogList);

export default userlog;
