import {
    Client,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandStringOption,
} from "discord.js";
import * as database from "../../database";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const osutimestamps = new SlashCommand()
    .setName("osutimestamps")
    .setDescription("Enable or disable osu! modding timestamps auto-detection")
    .setPermissions("ManageChannels")
    .setCategory(CommandCategory.Management)
    .addOptions(
        new SlashCommandStringOption()
            .setName("status")
            .setDescription("Enable or disable the detection of osu! timestamps in messages")
            .setRequired(true)
            .addChoices(
                {
                    name: "enable",
                    value: "true",
                },
                {
                    name: "disable",
                    value: "false",
                }
            )
    );

osutimestamps.setExecutable(async (command) => {
    if (!command.guild || !command.member) return;
    if (typeof command.member?.permissions == "string") return;

    const guild = await database.guilds.findOne({ _id: command.guildId });
    if (!guild) return;

    const status = command.options.get("status")
        ? command.options.get("status")?.value == "true"
        : true;

    guild.osuTimestamps = status;

    await database.guilds.updateOne({ _id: command.guildId }, { $set: { osuTimestamps: status } });

    return command.editReply({
        embeds: [
            generateSuccessEmbed(
                `${status ? "Enabled" : "Disabled"} osu! timestamp detection in messages!`
            ),
        ],
    });
});

export { osutimestamps };
