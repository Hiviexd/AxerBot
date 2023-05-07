import { EmbedBuilder, GuildMember, GuildChannel } from "discord.js";
import colors from "../../../../constants/colors";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { SendReportEmbed } from "../../../../responses/report/SendReportEmbed";

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

    const reportedUser = command.options.getMember("user");
    const reason = command.options.getString("reason", true);
    const image = command.options.getAttachment("image");

    if (reportedUser instanceof GuildMember) {
        SendReportEmbed({
            command,
            reason,
            image,
            reportedUser,
            reporter: command.member,
        });
    }
});

export default reportUser;
