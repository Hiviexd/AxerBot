import { Interaction, Role } from "discord.js";
import interactionOsuURL from "../osu/url/interactionOsuURL";

export default async (interaction: Interaction) => {
	if (!interaction.isMessageContextMenu()) return;

	const types: { [key: string]: any } = {
		"Display player info": "player",
		"Display beatmap info": "beatmap",
		"Display beatmap discussion info": "discussion",
		"Display comment info": "comment",
	};

	try {
		interactionOsuURL(interaction, types[interaction.commandName]);
	} catch (e) {
		console.error(e);

		interaction.reply({
			content: "Sorry something is wrong...",
			ephemeral: true,
		});
	}
};
