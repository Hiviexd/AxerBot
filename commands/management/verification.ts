import { Client, Message } from "discord.js";
import disable from "./subcommands/verification/disable";
import enable from "./subcommands/verification/enable";
import setChannel from "./subcommands/verification/setChannel";
import setFlags from "./subcommands/verification/setFlags";
import setMessage from "./subcommands/verification/setMessage";

export default {
	name: "verification",
	help: {
		description:
			"Verify new server members automatically with this system!",
		modules: `\`channel\`: Set the module channel
        \`tags\`: Set flags to the module (Example: sync nickname)
        \`message\`: Set the message to send on the channel
        \`enable\`: Enable the system manually
        \`disable\`: Yes`,
	},
	subcommands: [setChannel, setFlags, setMessage, enable, disable],
	category: "management",
	run: async (bot: Client, message: Message, args: string[]) => {},
};
