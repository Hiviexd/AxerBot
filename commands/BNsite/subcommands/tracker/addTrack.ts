import {
    ChannelType,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
} from "discord.js";
import { tracks } from "../../../../database";
import crypto from "crypto";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";

const addTracker = new SlashCommandSubcommand(
    "add",
    "Create a new tracker",
    {
        syntax: "/bntracker add `channel:#channel`",
    },
    [PermissionFlagsBits.ManageChannels]
);

addTracker.builder.addChannelOption((o) =>
    o.setName("channel").setDescription("Channel to announce").setRequired(true)
);

addTracker.setExecuteFunction(async (command) => {
    if (!command.member || typeof command.member.permissions == "string")
        return;

    const channel = command.options.getChannel("channel", true);

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

    const config = {
        modes: [] as string[],
        open: true,
        closed: true,
    };

    const id = crypto.randomBytes(30).toString("hex").slice(30);
    const newTrack = new tracks({
        _id: id,
        type: "qat",
        channel: channel.id,
        guild: command.guildId,
        targets: config,
    });

    setupModes();

    function setupModes() {
        const menu = new StringSelectMenuBuilder()
            .addOptions(
                {
                    label: "osu!",
                    value: "osu",
                },
                {
                    label: "osu!taiko",
                    value: "taiko",
                },
                {
                    label: "osu!catch",
                    value: "fruits",
                },
                {
                    label: "osu!mania",
                    value: "mania",
                }
            )
            .setMaxValues(4);

        generateStepEmbedWithChoices(
            command,
            "Select gamemodes to track",
            "It will be used to filter bns for a requested gamemode",
            menu
        )
            .then((modes) => {
                config.modes = modes.data;

                setupStatuses();
            })
            .catch(() => {
                command.editReply({
                    content: "",
                    embeds: [generateErrorEmbed("Time out!")],
                });
            });
    }

    function setupStatuses() {
        const menu = new StringSelectMenuBuilder()
            .addOptions(
                {
                    label: "When a BN opens",
                    value: "open",
                },
                {
                    label: "When a BN closes",
                    value: "closed",
                }
            )
            .setMaxValues(2);

        generateStepEmbedWithChoices(
            command,
            "Select statuses to track",
            "Filter bn request status",
            menu
        )
            .then(async (status) => {
                config.open = status.data.includes("open");
                config.closed = status.data.includes("closed");

                await newTrack.save();

                command.editReply({
                    content: "",
                    embeds: [generateSuccessEmbed("Tracker added!")],
                });
            })
            .catch(() => {
                command.editReply({
                    content: "",
                    embeds: [generateErrorEmbed("Time out!")],
                });
            });
    }
});

export default addTracker;
