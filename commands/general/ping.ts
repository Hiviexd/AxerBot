import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const ping = new SlashCommand()
    .setName("ping")
    .setDescription("Pong?")
    .setCategory(CommandCategory.General);

ping.setExecutable(async (command) => {
    return command.editReply("`" + command.client.ws.ping + " ms`");
});

export { ping };
