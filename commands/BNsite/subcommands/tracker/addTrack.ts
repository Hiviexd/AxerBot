import {
    ChannelType,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} from "discord.js";
import { tracks } from "../../../../database";
import crypto from "crypto";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const addTracker = new SlashCommandSubcommand(
    "add",
    "Create a new tracker",
    {
        syntax: "/bntracker add `channel:#channel` `status:open|closed|both` `mode:osu|taiko|catch|mania`",
        example:
            "/bntracker add `channel:#bn-forms` `status:both` `modes:osu,taiko,catch,mania`",
        "selecting modes":
            'Modes are split by commas "`,`";\nExample: `osu,taiko,mania`',
    },
    [PermissionFlagsBits.ManageChannels]
);

addTracker.builder
    .addChannelOption((o) =>
        o
            .setName("channel")
            .setDescription("Channel to announce")
            .setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("status")
            .setDescription("Filter bn status to announce")
            .addChoices(
                {
                    name: "open",
                    value: "open",
                },
                {
                    name: "close",
                    value: "closed",
                },
                {
                    name: "both",
                    value: "open,closed",
                }
            )
            .setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("modes")
            .setDescription("Filter bn modes (split by commas)")
            .setRequired(true)
    );

addTracker.setExecuteFunction(async (command) => {
    if (!command.member || typeof command.member.permissions == "string")
        return;

    const channel = command.options.getChannel("channel", true);
    const modes = command.options.getString("modes", true).split(",");
    const status = command.options.getString("status", true).split(",");

    const actualTrack = await tracks.find({
        guild: command.guildId,
        channel: channel.id,
        type: "qat",
    });

    if (actualTrack.length != 0)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "You can't add another tracker here. This channel already has a tracker."
                ),
            ],
        });

    if (channel.type != ChannelType.GuildText)
        return command.editReply({
            embeds: [
                generateErrorEmbed("You need to provide a valid text channel."),
            ],
        });

    const avaliableModes = ["osu", "taiko", "catch", "mania"];
    const clearModes: string[] = [];

    for (let mode of modes) {
        if (!avaliableModes.includes(mode)) {
            return command.editReply({
                embeds: [
                    generateErrorEmbed(
                        `The mode \`${mode}\` is not valid. Avaliable modes are: \`${avaliableModes.join(
                            ","
                        )}\`
							Make sure that modes are separated by comma.`
                    ),
                ],
            });
        }

        mode = mode.trim().toLowerCase();

        if (avaliableModes.includes(mode)) {
            clearModes.push(mode);
        }
    }

    const config = {
        modes: clearModes,
        open: status.includes("open"),
        closed: status.includes("closed"),
    };

    const id = crypto.randomBytes(30).toString("hex").slice(30);
    const newTrack = new tracks({
        _id: id,
        type: "qat",
        channel: channel.id,
        guild: command.guildId,
        targets: config,
    });

    await newTrack.save();

    command.editReply({
        embeds: [generateSuccessEmbed("Tracker added!")],
    });
});

export default addTracker;
