import { EmbedBuilder } from "discord.js";
import moment from "moment";
import colors from "../../../../constants/colors";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import truncateString from "../../../../helpers/text/truncateString";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { guilds } from "../../../../database";

const userlogList = new SlashCommandSubcommand(
    "list",
    "List all logs from a user",
    false,
    undefined
);

userlogList.builder.addUserOption((o) =>
    o.setName("username").setDescription("User to get logs").setRequired(true)
);

userlogList.setExecuteFunction(async (command) => {
    await command.deferReply();

    if (!command.member || typeof command.member.permissions == "string")
        return;

    let guild = await guilds.findById(command.guildId);
    if (!guild) return;

    const username = command.options.getString("username", true).toLowerCase();

    const userLogs = guild.user_logs.find((log) => log.username == username);

    if (!userLogs) {
        await command.editReply({
            embeds: [generateErrorEmbed("User not found")],
        });
        return;
    } else {
        //sort userlogs by date from newest to oldest
        userLogs.logs.sort((a, b) => {
            return (
                new Date(b.date || new Date()).valueOf() -
                new Date(a.date || new Date()).valueOf()
            );
        });
    }

    const embed = new EmbedBuilder()
        .setTitle(`📙 Logs for ${username.toLowerCase()}`)
        .setColor(colors.gold);

    if (userLogs.logs.length == 0) {
        embed.setDescription("*No logs found*");
    }

    userLogs.logs.forEach((log) => {
        embed.addFields({
            name: `Log #${userLogs.logs.indexOf(log) + 1}`,
            value: `<t:${moment(log.date).unix()}:R> | ${truncateString(
                log.reason ? log.reason : "No reason provided",
                1024
            )}`,
            inline: false,
        });
    });

    await command.editReply({ embeds: [embed] });
});

export default userlogList;
