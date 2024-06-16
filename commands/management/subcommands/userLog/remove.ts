import { EmbedBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const userlogRemoveLog = new SlashCommandSubcommand()
    .setName("remove")
    .setDescription("Remove a member log")
    .addOptions(
        new SlashCommandStringOption()
            .setName("username")
            .setDescription("Target user")
            .setRequired(true),
        new SlashCommandIntegerOption().setName("logid").setDescription("Log id").setRequired(true)
    )
    .setPermissions("ModerateMembers");

userlogRemoveLog.setExecutable(async (command) => {
    if (!command.guild || !command.member) return;

    const user = command.options.getString("username", true);
    const logid = command.options.getInteger("logid", true);

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    const userLogs = guild.user_logs.find((log) => log.username == user);
    let reason = null;

    if (!userLogs) {
        return command.editReply({
            embeds: [generateErrorEmbed("User not found!")],
        });
    } else {
        if (userLogs.logs.length < logid || logid < 1) {
            return command.editReply({
                embeds: [generateErrorEmbed("Log not found!")],
            });
        } else {
            //sort userlogs by date from newest to oldest
            userLogs.logs.sort((a, b) => {
                return (
                    new Date(b.date || new Date()).valueOf() -
                    new Date(a.date || new Date()).valueOf()
                );
            });

            reason = userLogs.logs[logid - 1].reason?.toString();

            userLogs.logs.splice(logid - 1, 1);
        }
    }

    await database.guilds.findByIdAndUpdate(command.guildId, {
        $set: { user_logs: guild.user_logs },
    });

    const embed = new EmbedBuilder()
        .setTitle("🗑️ Removed Log")
        .addFields(
            { name: "User", value: user },
            {
                name: "Reason",
                value: reason ? reason : "No reason provided",
            }
        )
        .setFooter({
            text: `${command.user.tag}`,
            iconURL: command.user.displayAvatarURL(),
        });

    return command.editReply({
        embeds: [embed],
    });
});

export { userlogRemoveLog };
