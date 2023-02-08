import { SlashCommand } from "../../models/commands/SlashCommand";

const ping = new SlashCommand("ping", "Pong?", "misc", true);

ping.setExecuteFunction(async (command) => {
	await command.deferReply(); // ? prevent errors

	return command.editReply("`" + command.client.ws.ping + " ms`");
});

export default ping;
