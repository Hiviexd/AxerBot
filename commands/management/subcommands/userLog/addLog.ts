import {
    ChatInputCommandInteraction,
    GuildMember,
    EmbedBuilder,
    PermissionFlagsBits,
} from "discord.js";
import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import colors from "../../../../constants/colors";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const userlogAddLog = new SlashCommandSubcommand(
    "new",
    "Add a new log to a member",
    false,
    undefined,
    [PermissionFlagsBits.ModerateMembers]
);

userlogAddLog.builder
    .addUserOption((o) =>
        o
            .setName("username")
            .setDescription("User to moderate")
            .setRequired(true)
    )
    .addStringOption((o) =>
        o.setName("reason").setDescription("Log description").setRequired(true)
    );

userlogAddLog.setExecuteFunction(async (command) => {
    if (!command.guild || !command.member) return;

    const user = command.options.getUser("username", true).username;
    const reason = command.options.getString("reason", true);

    if (reason.length > 1000) {
        return command.editReply({
            embeds: [
                generateErrorEmbed("Reason is too long! (1000 characters max)"),
            ],
        });
    }

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    const userLogs = guild.user_logs.find((log) => log.username == user);

    if (!userLogs) {
        guild.user_logs.push({
            username: user,
            logs: [
                {
                    reason: reason,
                    date: new Date(),
                },
            ],
        });
    } else {
        userLogs.logs.push({
            reason: reason,
            date: new Date(),
        });
    }

    await database.guilds.findByIdAndUpdate(command.guildId, {
        $set: { user_logs: guild.user_logs },
    });

    const embed = new EmbedBuilder()
        .setTitle("✅ User Logged")
        .setColor(colors.green)
        .addFields(
            { name: "User", value: user },
            {
                name: "Reason",
                value: reason,
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

export default userlogAddLog;
