import {
    ButtonStyle,
    ChannelType,
    GuildChannelResolvable,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
} from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import UserNotFound from "../../../../responses/embeds/UserNotFound";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import crypto from "crypto";
import { tracks } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { BeatmapsetEventType } from "../../../../types/beatmap";
import { UserRecentEventType } from "../../../../types/user";
import { generateConfirmEmbedWithChoices } from "../../../../helpers/commands/generateConfirmEmbedWithChoices";

const mapperTrackerNewTracker = new SlashCommandSubcommand(
    "new",
    "Create a new mapper tracker",
    undefined,
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages]
);

mapperTrackerNewTracker.builder
    .addStringOption((o) => o.setName("mapper").setDescription("Mapper username").setRequired(true))
    .addChannelOption((o) =>
        o
            .setName("channel")
            .setDescription("Channel to announce the system")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    );

mapperTrackerNewTracker.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    const mapperUsername = command.options.getString("mapper", true);
    const channel = command.options.getChannel("channel", true);

    const mapperProfile = await osuApi.fetch.user(mapperUsername);

    if (mapperProfile.status != 200 || !mapperProfile.data)
        return command.editReply({
            embeds: [UserNotFound],
        });

    const botMember = command.guild.members.cache.get(command.client.user.id);

    if (
        !botMember ||
        !botMember
            .permissionsIn(channel as GuildChannelResolvable)
            .has(PermissionFlagsBits.SendMessages)
    )
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❌ Invalid channel!",
                    "I don't have permissions to send messages on that channel!"
                ),
            ],
        });

    const trackerCheck = await tracks.find({
        guild: command.guildId,
        type: "mapper",
    });

    if (trackerCheck.length >= 25)
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❌ Tracker limit reached!",
                    "You can't add more than 25 trackers!"
                ),
            ],
        });

    if (
        trackerCheck.find(
            (t) => t.userId == mapperProfile.data.id.toString() && t.channel == channel.id
        )
    )
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❌ Invalid user!",
                    "You can't add this user again to this channel!"
                ),
            ],
        });

    requestTargets();
    let targets: string[] = [];

    function requestTargets() {
        const selectMenu = new StringSelectMenuBuilder()
            .setOptions(
                {
                    label: "New Beatmap",
                    value: UserRecentEventType.BeatmapsetUpload,
                },
                {
                    label: "Update Upload",
                    value: UserRecentEventType.BeatmapsetUpdate,
                },
                {
                    label: "Revive",
                    value: UserRecentEventType.BeatmapsetRevive,
                },
                {
                    label: "Ranked",
                    value: BeatmapsetEventType.RANK,
                },
                {
                    label: "Nomination",
                    value: BeatmapsetEventType.NOMINATE,
                },
                {
                    label: "Qualified",
                    value: BeatmapsetEventType.QUALIFY,
                },
                {
                    label: "Disqualify",
                    value: BeatmapsetEventType.DISQUALIFY,
                },
                {
                    label: "Nomination Reset",
                    value: BeatmapsetEventType.NOMINATION_RESET,
                },
                {
                    label: "Loved",
                    value: BeatmapsetEventType.LOVE,
                },
                {
                    label: "Tags Edit",
                    value: BeatmapsetEventType.TAGS_EDIT,
                },
                {
                    label: "Genre Edit",
                    value: BeatmapsetEventType.GENRE_EDIT,
                },
                {
                    label: "Language Edit",
                    value: BeatmapsetEventType.LANGUAGE_EDIT,
                },
                {
                    label: "Owner Change",
                    value: BeatmapsetEventType.BEATMAP_OWNER_CHANGE,
                }
            )
            .setMinValues(1);
        selectMenu.setMaxValues(selectMenu.options.length);

        generateStepEmbedWithChoices(
            command,
            "📑 Select data to track",
            "Please select one of the options below",
            selectMenu,
            undefined,
            true
        )
            .then((values) => {
                if (!values.data) return;
                targets = values.data;

                confirm();
            })
            .catch((e) => {
                return command.editReply({
                    content: "",
                    embeds: [
                        generateErrorEmbed(
                            "Don't leave me waiting here! Please, do your things during the correct time."
                        ),
                    ],
                });
            })
            .catch(() => {
                return command.editReply({
                    content: "",
                    components: [],
                    embeds: [generateErrorEmbed("Time out! Don't leave me waiting.")],
                });
            });
    }

    function confirm() {
        const targetTypes = {
            nominate: "Nominate",
            qualify: "Qualify",
            disqualify: "Disqualify",
            nomination_reset: "Nomination Reset",
            nomination_reset_received: "Nomination Reset",
            rank: "Rank",
            genre_edit: "Genre Edit",
            language_edit: "Language Edit",
            tags_edit: "Tags Edit",
            beatmap_owner_change: "Owner Change",
            beatmapsetRevive: "Revive",
            beatmapsetUpload: "Upload",
            beatmapsetUpdate: "Update",
        } as {
            [key: string]: string;
        };

        generateConfirmEmbedWithChoices(
            command,
            "This is your new tracker",
            `__**${mapperProfile.data.username}**__\n<#${channel.id}> [${targets
                .map((target) => targetTypes[target])
                .join(", ")}]\n\n`,
            [
                {
                    label: "Edit Targets",
                    callback: () => {
                        requestTargets();
                    },
                    type: ButtonStyle.Secondary,
                },
            ],
            createTracker,
            undefined,
            true,
            true
        ).catch(() => {
            return command.editReply({
                content: "",
                components: [],
                embeds: [generateErrorEmbed("Time out! Don't leave me waiting.")],
            });
        });
    }

    async function createTracker() {
        const trackerId = crypto.randomBytes(15).toString("hex");

        if (targets.includes(BeatmapsetEventType.NOMINATION_RESET)) {
            targets.push(BeatmapsetEventType.NOMINATION_RESET_RECEIVED);
        }

        await tracks.create({
            _id: trackerId,
            channel: channel.id,
            guild: command.guild?.id,
            targetsArray: targets,
            type: "mapper",
            userId: mapperProfile.data.id,
        });

        command.editReply({
            content: "",
            components: [],
            embeds: [generateSuccessEmbed("Tracker created!")],
        });
    }
});

export default mapperTrackerNewTracker;
