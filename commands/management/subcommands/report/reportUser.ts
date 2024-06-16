import {
    GuildMember,
    SlashCommandAttachmentOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { SendReportEmbed } from "../../../../responses/report/SendReportEmbed";

const reportUser = new SlashCommandSubcommand()
    .setName("create")
    .setDescription("Report a user to the server moderators")
    .setEphemeral(true)
    .addOptions(
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("User to report")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("Reason for report")
            .setRequired(true),
        new SlashCommandAttachmentOption()
            .setName("image")
            .setDescription("Image to attach to report")
    );

reportUser.setExecutable(async (command) => {
    if (!command.guild || !command.member || !command.channel) return;
    if (!(command.member instanceof GuildMember)) return;

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

export { reportUser };
