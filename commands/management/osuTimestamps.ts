import {
    Client,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} from "discord.js";
import * as database from "../../database";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";

const osutimestamps = new SlashCommand(
    "osutimestamps",
    "Enable or disable the detection of osu! timestamps in messages",
    "management",
    false,
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

osutimestamps.builder.addStringOption((o) =>
    o
        .setName("status")
        .setDescription(
            "Enable or disable the detection of osu! timestamps in messages"
        )
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

osutimestamps.setExecuteFunction(async (command) => {
    await command.deferReply();
    if (!command.guild || !command.member) return;
    if (typeof command.member?.permissions == "string") return;

    const guild = await database.guilds.findOne({ _id: command.guildId });
    if (!guild) return;

    const status = command.options.get("status")
        ? command.options.get("status")?.value == "true"
        : true;

    guild.osuTimestamps = status;

    await database.guilds.updateOne(
        { _id: command.guildId },
        { $set: { osuTimestamps: status } }
    );

    return command.editReply({
        embeds: [
            generateSuccessEmbed(
                `${
                    status ? "Enabled" : "Disabled"
                } osu! timestamp detection in messages!`
            ),
        ],
    });
});

export default osutimestamps;
