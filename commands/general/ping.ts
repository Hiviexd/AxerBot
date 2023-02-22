import { SlashCommand } from "../../models/commands/SlashCommand";

const ping = new SlashCommand("ping", "Pong?", "General", true);

ping.setExecuteFunction(async (command) => {
    return command.editReply("`" + command.client.ws.ping + " ms`");
});

export default ping;
