import { SlashCommand } from "../../models/commands/SlashCommand";
import osuApi from "../../modules/osu/fetcher/osuApi";
import checkCommandPlayers from "../../modules/osu/player/checkCommandPlayers";
import UserNotFound from "../../responses/embeds/UserNotFound";
import RecentScoreEmbed from "../../responses/osu/RecentScoreEmbed";

const recent = new SlashCommand(
    ["rs", "recent"],
    "Get the most recent score of a player",
    "osu!",
    true,
    {
        syntax: "/rs `username` `?mode`",
        example: "/rs `username:sebola` `mode:taiko`",
    }
);

recent.builder
    .addStringOption((option) =>
        option.setName("username").setDescription("Player username")
    )
    .addStringOption((option) =>
        option
            .setName("mode")
            .setDescription("Game mode of the score")
            .addChoices(
                {
                    name: "osu",
                    value: "osu",
                },
                {
                    name: "taiko",
                    value: "taiko",
                },
                {
                    name: "catch",
                    value: "fruits",
                },
                {
                    name: "mania",
                    value: "mania",
                }
            )
    );

recent.setExecuteFunction(async (command) => {
    const modeInput = command.options.get("mode");
    const mode = modeInput ? modeInput.value?.toString() : undefined;
    const passed = command.options.getNumber("passed") || 1;

    let { playerName, status } = await checkCommandPlayers(command);

    const player = await osuApi.fetch.user(playerName);

    if (player.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
            allowedMentions: {
                repliedUser: false,
            },
        });

    if (!player.data || !player.data.id)
        return command.editReply({
            embeds: [UserNotFound],
            allowedMentions: {
                repliedUser: false,
            },
        });

    if (status != 200)
        return command.editReply({
            embeds: [UserNotFound],
            allowedMentions: {
                repliedUser: false,
            },
        });

    const recent = await osuApi.fetch.userRecent(
        player.data.id.toString(),
        passed,
        mode
    );

    if (
        !recent.data[0] ||
        !recent.data[0].user ||
        !recent.data[0].beatmapset ||
        !recent.data[0].beatmap
    )
        return command.editReply({
            content: `**${player.data.username}** doesn't have any recent scores`,
            allowedMentions: {
                repliedUser: false,
            },
        });

    RecentScoreEmbed.send(command, recent.data[0], player.data);
});

export default recent;

// export default {
// 	name: "rs",
// 	help: {
// 		description: "Check statistics for a player",
// 		syntax: "/rs `username` `?mode`",
// 		example: "/rs `username:sebola` `mode:taiko`",
// 	},
// 	category: "osu",
// 	config: {
// 		type: 1,
// 		options: [
// 			{
// 				name: "username",
// 				description: "By osu! username",
// 				type: 3,
// 				max_value: 1,
// 			},
// 			/*{
// 				name: "usermention",
// 				description: "By user mention (This doesn't ping the user)",
// 				type: 6,
// 				max_value: 1,
// 			},*/
// 			{
// 				name: "mode",
// 				description: "Gamemode info to view",
// 				type: 3,
// 				max_value: 1,
// 				choices: [

// 				],
// 			},
// 			{
// 				name: "passed",
// 				description: "Include only passed scores?",
// 				type: ApplicationCommandOptionType.Number,
// 				max_value: 1,
// 				choices: [
// 					{
// 						name: "yes",
// 						value: 0,
// 					},
// 					{
// 						name: "no",
// 						value: 1,
// 					},
// 				],
// 			},
// 		],
// 	},
// 	interaction: true,
// 	run: async (
// 		bot: Client,
// 		command: ChatInputCommandInteraction,
// 		args: string[]
// 	) => {

// },
// };
