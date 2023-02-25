import { EmbedBuilder } from "discord.js";

import colors from "../../../../constants/colors";
import { guilds } from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const gtfLeaderboard = new SlashCommandSubcommand(
    "leaderboard",
    "Display server top 10 games"
);

gtfLeaderboard.setExecuteFunction(async (command) => {
    if (!command.guild)
        return command.editReply({
            embeds: [generateErrorEmbed("You can't run this command here!")],
        });

    const guild = await guilds.findById(command.guildId);

    if (!guild) return;
    let leaderboard = guild.flaglb || [];

    leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));

    leaderboard = leaderboard.slice(0, 9);

    const embed = new EmbedBuilder()
        .setTitle("🏅 Top 10 players of this server")
        .setColor(colors.yellow)
        .setDescription(
            `${
                leaderboard.length == 0
                    ? "No games found..."
                    : leaderboard
                          .map(
                              (game, index) =>
                                  `**#${index + 1} |** <@${
                                      game.userId
                                  }> **|** \`${game.score}\` points`
                          )
                          .join("\n")
            }`
        );

    command.editReply({
        embeds: [embed],
    });
});

export default gtfLeaderboard;
