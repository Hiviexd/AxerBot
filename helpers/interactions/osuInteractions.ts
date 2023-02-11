import { Interaction, Role } from "discord.js";
import interactionOsuURL from "../osu/url/interactionOsuURL";

export default async (interaction: Interaction) => {
    // if (!interaction.isSel()) return;
    // const types: { [key: string]: any } = {
    // 	"Display player info": "player",
    // 	"Display beatmap info": "beatmap",
    // 	"Display beatmap discussion info": "discussion",
    // 	"Display comment info": "comment",
    // };
    // interaction.deferReply({
    // 	ephemeral: true,
    // });
    // try {
    // 	interactionOsuURL(interaction, types[interaction.commandName]);
    // } catch (e) {
    // 	console.error(e);
    // 	interaction.editReply({
    // 		content: "Sorry something is wrong...",
    // 	});
    // }
};
