import { SlashCommand } from "../../models/commands/SlashCommand";
import UserNotFound from "../../responses/embeds/UserNotFound";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import PlayerEmbed from "../../responses/osu/PlayerEmbed";
import checkCommandPlayers from "../../helpers/osu/player/checkCommandPlayers";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

const player = new SlashCommand(
    ["player", "profile"],
    "Check statistics for a player",
    "osu",
    false,
    {
        syntax: "/player `<name>` `<-?mode>`",
        example: "/player `username:Hivie` `mode:osu`",
        note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
    }
);

player.builder
    .addStringOption((o) =>
        o.setName("username").setDescription("Username of the player")
    )
    .addStringOption((o) =>
        o.setName("mode").setDescription("Profile game mode").addChoices(
            {
                name: "osu!",
                value: "osu",
            },
            {
                name: "osu!taiko",
                value: "taiko",
            },
            {
                name: "osu!catch",
                value: "fruits",
            },
            {
                name: "osu!mania",
                value: "mania",
            }
        )
    );

player.setExecuteFunction(async (command) => {
    await command.deferReply();

    const mode = command.options.getString("mode") || undefined;

    let { playerName, status } = await checkCommandPlayers(command);

    const player = await osuApi.fetch.user(playerName, mode);

    if (status != 200)
        return command.editReply({
            embeds: [UserNotFound],
            allowedMentions: {
                repliedUser: false,
            },
        });

    if (!player.data.is_active)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    `${player.data.username} is inactive in this game mode`
                ),
            ],
            allowedMentions: {
                repliedUser: false,
            },
        });

    return PlayerEmbed.reply(player, command, mode);
});

export default player;
/*
export default {
	name: "player",
	help: {
		description: "Check statistics for a player",
		syntax: "/player `<name|mention>` `<-?mode>`",
		example: "/player `Hivie` `-osu`\n /player <@341321481390784512> ",
		note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
	},
	category: "osu",
	config: {
		type: 1,
		options: [
			{
				name: "username",
				description: "By osu! username",
				type: 3,
				max_value: 1,
			},
			/*{
				name: "usermention",
				description: "By user mention (This doesn't ping the user)",
				type: 6,
				max_value: 1,
			},
			{
				name: "mode",
				description: "Gamemode info to view",
				type: 3,
				max_value: 1,
				choices: [
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
					},
				],
			},
		],
	},
	interaction: true,
	run: async (
		bot: Client,
		command: ChatInputCommandInteraction,
		args: string[]
	) => {
		
	},
};
*/
