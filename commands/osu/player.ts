import { SlashCommandStringOption } from "discord.js";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import osuApi from "../../modules/osu/fetcher/osuApi";
import checkCommandPlayers from "../../modules/osu/player/checkCommandPlayers";
import UserNotFound from "../../responses/embeds/UserNotFound";
import PlayerEmbed from "../../responses/osu/PlayerEmbed";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const player = new SlashCommand()
    .setName("player")
    .setNameAliases(["profile"])
    .setDescription("Check statistics of an osu! player")
    .setCategory(CommandCategory.Osu)
    .setDMPermission(true)
    .addOptions(
        new SlashCommandStringOption().setName("username").setDescription("Username of the player"),
        new SlashCommandStringOption()
            .setName("mode")
            .setDescription("Profile game mode")
            .addChoices(
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

player.setExecutable(async (command) => {
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
            embeds: [generateErrorEmbed(`${player.data.username} is inactive in this game mode`)],
            allowedMentions: {
                repliedUser: false,
            },
        });

    return PlayerEmbed.reply(player, command, mode);
});

export { player };
