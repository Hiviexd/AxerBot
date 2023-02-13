import { SlashCommand } from "../../models/commands/SlashCommand";

const ping = new SlashCommand("ping", "Pong?", "Miscellaneous", true);

ping.setExecuteFunction(async (command) => {
    // ? prevent errors

    return command.editReply("`" + command.client.ws.ping + " ms`");
});

export default ping;
