import { ApplicationCommandType } from "discord.js";
import { ContextMenuCommand } from "../../models/commands/ContextMenuCommand";

export default new ContextMenuCommand()
    .setName("test")
    .setType(ApplicationCommandType.Message)
    .setEphemeral(true)
    .setExecuteFunction(async (command) => {
        command.editReply("dick");
    });
