import { SlashCommandChannelOption } from "discord.js";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const loggingChannel = new SlashCommandSubcommand()
    .setName("channel")
    .setDescription("Set a channel to send all logs")
    .setPermissions("ManageGuild")
    .addOptions(
        new SlashCommandChannelOption()
            .setName("channel")
            .setDescription("Channel to set")
            .setRequired(true)
    );

loggingChannel.setExecutable(async (command) => {
    if (!command.guild || !command.member) return;

    const channel = await command.options.getChannel("channel", true);

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    guild.logging.channel = channel.id;

    await database.guilds.findByIdAndUpdate(command.guildId, {
        $set: { logging: guild.logging },
    });

    return command.editReply({
        embeds: [generateSuccessEmbed(`✅ Logging system channel changed to ${channel}`)],
    });
});

export { loggingChannel };
