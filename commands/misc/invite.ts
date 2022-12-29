import { Client, CommandInteraction, Message } from "discord.js";

export default {
	name: "invite",
	help: {
		description: "Generates an invite link for the bot",
		example: "/invite",
	},
	category: "misc",
	interaction: true,
	config: {
		type: 1,
	},
	run: async (
		bot: Client,
		interaction: CommandInteraction,
		args: string[]
	) => {
		await interaction.deferReply(); // ? prevent errors

		const invite =
			"https://discord.com/api/oauth2/authorize?client_id=937807478429745213&permissions=1256748215504&scope=bot%20applications.commands";

		return interaction.editReply({
			embeds: [
				{
					title: "Invite Link",
					description: `Click **[here](${invite})** to invite me to your server!
                    
                    The initial prefix will be \`-\``,
					color: "#0099ff",
				},
			],
		});
	},
};
