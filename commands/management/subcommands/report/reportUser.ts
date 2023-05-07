import { EmbedBuilder, GuildMember, GuildChannel } from "discord.js";
import colors from "../../../../constants/colors";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const reportUser = new SlashCommandSubcommand(
    "user",
    "Report a user to the server moderators",
    {
        syntax: "/report `user` `user:<user>` `reason:<reason>`",
        example: "/report `user` `user:@user#0001` `reason:spamming`",
    },
    undefined,
    true
);

reportUser.builder.addUserOption((o) =>
    o.setName("user").setDescription("User to report").setRequired(true)
);

reportUser.builder.addStringOption((o) =>
    o.setName("reason").setDescription("Reason for report").setRequired(true)
);

reportUser.builder.addAttachmentOption((o) =>
    o.setName("image").setDescription("Image to attach to report")
);

reportUser.setExecuteFunction(async (command) => {
    if (!command.guild || !command.member || !command.channel) return;
    if (!(command.member instanceof GuildMember)) return;

    await command.deferReply({ ephemeral: true });

    const user = command.options.getUser("user", true);
    const reason = command.options.getString("reason", true);
    const image = command.options.getAttachment("image");

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.followUp({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
            ephemeral: true,
        });

    const channel = guild.reports.channel;

    if (!channel)
        return command.followUp({
            embeds: [
                generateErrorEmbed(
                    "The reports system in this server isn't active."
                ),
            ],
            ephemeral: true,
        });

    const embed = new EmbedBuilder()
        .setTitle("⚠️ Report")
        .setColor(colors.yellow)
        .setAuthor({
            name: command.member.nickname
                ? command.member.nickname
                : command.user.username,
            iconURL: command.user.displayAvatarURL(),
        })
        .setDescription(`Reported user ${user} in ${command.channel}`)
        .addFields(
            {
                name: "Reason",
                value: reason,
            },
            {
                name: "Reported",
                value: user.tag,
                inline: true,
            },
            {
                name: "Reporter",
                value: command.member.nickname
                    ? `${command.member.nickname} (${command.user.tag})`
                    : command.user.tag,
                inline: true,
            },
            {
                name: "Channel",
                value: (command.channel as GuildChannel).name,
                inline: true,
            },
            {
                name: "Reported ID",
                value: user.id,
                inline: true,
            },
            {
                name: "Reporter ID",
                value: command.user.id,
                inline: true,
            }
        )
        .setTimestamp();

    if (image) embed.setImage(image.url);

    const reportsChannel: any = command.guild.channels.cache.get(channel);

    if (!reportsChannel)
        return command.followUp({
            embeds: [
                generateErrorEmbed(
                    "Cannot find reports channel as it may not exist. Please notify the server administrators."
                ),
            ],
            ephemeral: true,
        });

    reportsChannel
        .send({
            content: guild.reports.ping ? `<@&${guild.reports.role}>` : "",
            embeds: [embed],
        })
        .catch((e: any) => console.error(e));

    command.followUp({
        embeds: [generateSuccessEmbed("User reported!")],
        ephemeral: true,
    });
});

export default reportUser;
