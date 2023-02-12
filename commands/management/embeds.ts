import {
    Client,
    Channel,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} from "discord.js";
import * as database from "../../database";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";

const embeds = new SlashCommand(
    "embeds",
    "configure where and which embed will be allowed in X channels",
    "Management",
    false,
    {
        description:
            "configure where and which embed will be allowed in X channels",
        syntax: "/embeds `<categories> <#channels>`",
        example:
            "/embeds `player,discussion,beatmap #osu #commands` \n/embeds `player,discussion,beatmap all` \n /embeds `player,discussion,beatmap none`",
        categories: ["`player`", "`comment`", "`beatmap`", "`discussion`"],
        extra: "You can use `all` or `none` to select all channels, or none",
    },
    [PermissionFlagsBits.ManageChannels]
);

embeds.builder
    .addStringOption((o) =>
        o
            .setName("embed")
            .setDescription("Which embed type do you want to manage?")
            .setRequired(true)
            .addChoices(
                {
                    name: "player/mapper",
                    value: "player",
                },
                {
                    name: "comment",
                    value: "comment",
                },
                {
                    name: "beatmap",
                    value: "beatmap",
                },
                {
                    name: "modding",
                    value: "discussion",
                }
            )
    )
    .addStringOption((o) =>
        o
            .setName("channels")
            .setDescription(
                `You can mention channels or type "all" for all channels or "none" for block.`
            )
            .setRequired(true)
    );

embeds.setExecuteFunction(async (command) => {
    await command.deferReply();
    if (!command.guild) return;

    if (!command.member || !command.guild) return;

    if (typeof command.member?.permissions == "string") return;

    const channel = command.options.getString("channels", true);

    const channelIds = channel
        .replace(/ /g, ",")
        .replace(/<#/g, "")
        .replace(/>/g, "")
        .split(",");

    const mentionedChannels: Channel[] = [];

    if (!["all", "none"].includes(channel)) {
        for (const _id of channelIds) {
            try {
                const req = await command.guild.channels.fetch(_id);

                if (req && req.isTextBased()) {
                    if (req.guildId == command.guildId) {
                        mentionedChannels.push(req);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        if (mentionedChannels.length < 1)
            return command.editReply({
                embeds: [
                    generateErrorEmbed(
                        ":x: You need to mention valid **TEXT CHANNELS**"
                    ),
                ],
            });
    }

    const targetOption = channel;

    if (mentionedChannels.length < 1) {
        if (!["all", "none"].includes(targetOption))
            return command.editReply({
                embeds: [
                    generateErrorEmbed(
                        ":x: Invalid channels/options provided.You can mention channels or use `none` option to disable this category in all channels or `all` to enable inall channels."
                    ),
                ],
            });
    }

    const category = command.options.getString("embed", true);

    const guild = await database.guilds.findById(command.guildId);

    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated! Please, wait some seconds and try again."
                ),
            ],
        });

    if (targetOption == "all") {
        guild.embeds[category] = {
            all: true,
            none: false,
            channels: [],
        };
    }

    if (targetOption == "none") {
        guild.embeds[category] = {
            all: false,
            none: true,
            channels: [],
        };
    }

    if (!["all", "none"].includes(targetOption)) {
        guild.embeds[category] = {
            all: false,
            none: false,
            channels: mentionedChannels.map((c) => c.id),
        };
    }

    const texts: { [key: string]: string } = {
        all: "Done! This category is enabled in all channels.",
        none: `Done! This category is disabled for all channels.`,
        channel: `:white_check_mark: Done! This category is enabled in ${mentionedChannels.join(
            ", "
        )}`,
    };

    await database.guilds.findByIdAndUpdate(guild._id, guild);

    return await command.editReply({
        embeds: [
            generateSuccessEmbed(
                ["all", "none"].includes(channel)
                    ? texts[channel]
                    : texts["channel"]
            ),
        ],
    });
});

export default embeds;
