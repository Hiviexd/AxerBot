import crypto from "crypto";
import {
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
} from "discord.js";

import colors from "../../../../constants/colors";
import { guilds } from "../../../../database";
import createNewGuild from "../../../../database/utils/createNewGuild";
import { generateConfirmEmbedWithChoices } from "../../../../helpers/commands/generateConfirmEmbedWithChoices";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import { generateStepTextInput } from "../../../../helpers/commands/generateStepTextInput";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import getEmoji from "../../../../helpers/text/getEmoji";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

export enum MapperRoleType {
    "RankedMapper" = "r",
    "LovedMapper" = "l",
    "AspirantMapper" = "a",
}

export interface IMapperRole {
    roles: string[];
    target: MapperRoleType;
    modes: string[];
    min: number;
    max: number;
}

const verificationAddMapperRole = new SlashCommandSubcommand(
    "mapperrole",
    "Sets roles based on the amount of a user's Ranked/Loved/Unranked beatmaps",
    {
        important: "Guest difficulty beatmaps are not counted",
    },
    [PermissionFlagsBits.ManageGuild]
);

verificationAddMapperRole.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    let guild = await guilds.findById(command.guild.id);

    if (!guild) guild = await createNewGuild(command.guild);
    if (!guild) return;

    if (!guild.verification.mapper_roles) guild.verification.mapper_roles = [];

    if (guild.verification.mapper_roles.length == 25)
        return command.editReply({
            embeds: [
                generateErrorEmbed("You can't add more than 25 mapper roles!"),
            ],
        });

    const mapperTitles: { [key: string]: string } = {
        r: `Ranked Mappers`,
        l: `Loved Mappers`,
        a: `Unranked Mappers`,
    };

    const beatmapTitles: { [key: string]: string } = {
        r: `ranked`,
        l: `loved`,
        a: `graveyard or pending`,
    };

    const mapperTitlesWithEmoji: { [key: string]: string } = {
        r: `${getEmoji("ranked")} Ranked Mappers`,
        l: `${getEmoji("loved")} Loved Mappers`,
        a: `${getEmoji("graveyard")} Unranked Mappers`,
    };

    const entry: IMapperRole = {
        roles: [] as string[],
        target: MapperRoleType.RankedMapper,
        modes: ["osu", "taiko", "mania", "fruits"],
        min: 1,
        max: 10,
    };

    start();

    async function start() {
        if (!command.guild) return;

        const selectMenu = new StringSelectMenuBuilder()
            .setPlaceholder("Ranked Mapper")
            .setOptions(
                {
                    label: "Ranked Mappers",
                    value: MapperRoleType.RankedMapper,
                },
                {
                    label: "Loved Mappers",
                    value: MapperRoleType.LovedMapper,
                },
                {
                    label: "Unranked Mappers",
                    value: MapperRoleType.AspirantMapper,
                }
            )
            .setCustomId(crypto.randomUUID());

        generateStepEmbedWithChoices<MapperRoleType[]>(
            command,
            "Mapper Group",
            "Select the group of users to receive roles",
            selectMenu,
            undefined,
            true
        )
            .then((value) => {
                const choice = value.data;
                entry.target = choice[0];

                selectModes(() => {
                    selectRoles(() => {
                        selectRange();
                    });
                });
            })
            .catch(() => {
                command.editReply({
                    embeds: [generateErrorEmbed("Time expired!")],
                    components: [],
                });
            });
    }

    async function selectModes(callback: Function) {
        if (!command.guild) return;

        const selectMenu = new StringSelectMenuBuilder()
            .setPlaceholder("Game Modes")
            .setOptions(
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
            .setMinValues(1)
            .setMaxValues(4)
            .setCustomId(crypto.randomUUID());

        generateStepEmbedWithChoices<string[]>(
            command,
            "Game Modes",
            "Select the game mode for this check",
            selectMenu,
            undefined,
            true
        )
            .then((value) => {
                const choice = value.data;
                entry.modes = choice;

                if (callback) return callback();

                selectRoles(selectRange);
            })
            .catch(() => {
                command.editReply({
                    embeds: [generateErrorEmbed("Time expired!")],
                    components: [],
                });
            });
    }

    function selectRoles(callback?: Function) {
        const selectMenu = new RoleSelectMenuBuilder()
            .setPlaceholder("Ranked Mapper")
            .setMinValues(1)
            .setMaxValues(10)
            .setCustomId(crypto.randomUUID());

        generateStepEmbedWithChoices<string[]>(
            command,
            "Roles Selection",
            `Select roles that ${mapperTitles[entry.target]} will receive`,
            selectMenu,
            undefined,
            true
        )
            .then((value) => {
                const choice = value.data;

                entry.roles = choice;

                if (callback) return callback();

                sendConfirm();
            })
            .catch(() => {
                command.editReply({
                    embeds: [generateErrorEmbed("Time expired!")],
                    components: [],
                });
            });
    }

    function sendConfirm() {
        const embed = new EmbedBuilder()
            .setTitle("Please confirm your configuration")
            .addFields(
                {
                    name: "Target",
                    value: mapperTitlesWithEmoji[entry.target],
                },
                {
                    name: "Roles",
                    value: entry.roles
                        .map((r, i) => `**#${i + 1} |** <@&${r}>`)
                        .join("\n"),
                },
                {
                    name: "Game Modes",
                    value: `${entry.modes
                        .map((m) => `\`osu!${m.replace("fruits", "catch")}\``)
                        .join(",")}`,
                },
                {
                    name: "Range",
                    value: `Between **${entry.min}** and **${entry.max}** ${
                        beatmapTitles[entry.target]
                    } beatmaps`,
                }
            )
            .setColor(colors.yellowBright);

        generateConfirmEmbedWithChoices(
            command,
            "Please confirm your configuration",
            "Are you sure you want to save this configuration?",
            [
                {
                    label: "Edit Roles",
                    callback: () => {
                        selectRoles(sendConfirm);
                    },
                    type: ButtonStyle.Secondary,
                },
                {
                    label: "Edit Modes",
                    callback: () => {
                        selectModes(sendConfirm);
                    },
                    type: ButtonStyle.Secondary,
                },
                {
                    label: "Edit Range",
                    callback: () => {
                        selectRange();
                    },
                    type: ButtonStyle.Secondary,
                },
            ],
            save,
            embed,
            false,
            true
        ).catch((e) => {
            if (e.reason == "timeout")
                return command.editReply({
                    embeds: [
                        generateErrorEmbed("Timed out, please try again!"),
                    ],
                });

            console.error(e);

            command.editReply({
                embeds: [generateErrorEmbed("Something went wrong!")],
            });
        });
    }

    function selectRange(callback?: Function) {
        selectMin();

        function selectMin() {
            const embed = new EmbedBuilder()
                .setTitle(
                    `Minimum amount of ${beatmapTitles[entry.target]} beatmaps`
                )
                .setDescription(
                    "Send a message with the minimum amount of beatmaps you want"
                )
                .setColor(colors.yellow)
                .setFooter({
                    text: "You have 1 minute to send!",
                });

            command
                .editReply({
                    components: [],
                    content: "",
                    embeds: [embed],
                })
                .then(() => {
                    generateStepTextInput(command, true)
                        .then((input) => {
                            const min = Number(input.data.trim());

                            if (isNaN(min)) {
                                sendInvalidInput();

                                return setTimeout(selectMin, 5000);
                            }

                            entry.min = min;

                            selectMax();
                        })
                        .catch((e) => {
                            if (e.reason == "timeout")
                                return command.editReply({
                                    embeds: [
                                        generateErrorEmbed(
                                            "Don't leave me waiting too much!"
                                        ),
                                    ],
                                });

                            console.error(e);

                            command.editReply({
                                embeds: [
                                    generateErrorEmbed("Something went wrong!"),
                                ],
                            });
                        });
                });
        }

        function selectMax() {
            const embed = new EmbedBuilder()
                .setTitle(
                    `Max amount of ${beatmapTitles[entry.target]} beatmaps`
                )
                .setDescription(
                    "Send a message with the maximum amount of beatmaps you want"
                )
                .setColor(colors.yellow)
                .setFooter({
                    text: "You have 1 minute to send!",
                });

            command
                .editReply({
                    components: [],
                    content: "",
                    embeds: [embed],
                })
                .then(() => {
                    generateStepTextInput(command, true)
                        .then((input) => {
                            const max = Number(input.data.trim());

                            if (isNaN(max) || max < entry.min) {
                                sendInvalidInput();

                                return setTimeout(selectMax, 5000);
                            }

                            entry.max = max;

                            if (callback) return callback();

                            sendConfirm();
                        })
                        .catch((e) => {
                            if (e.reason == "timeout")
                                return command.editReply({
                                    embeds: [
                                        generateErrorEmbed(
                                            "Timed out, please try again!"
                                        ),
                                    ],
                                });

                            console.error(e);

                            command.editReply({
                                embeds: [
                                    generateErrorEmbed("Something went wrong!"),
                                ],
                            });
                        });
                });
        }

        function sendInvalidInput() {
            command.editReply({
                embeds: [
                    generateErrorEmbed(
                        "Invalid number! Input must be a number between 0 and 1000 or higher than min range."
                    ),
                ],
                components: [],
            });
        }
    }

    function save() {
        if (!guild) return;

        if (
            guild.verification.mapper_roles.find(
                (r: typeof entry) => r == entry
            )
        )
            return sendEmbed();

        guild.verification.mapper_roles.push(entry);

        guilds
            .updateOne(
                { _id: guild._id },
                {
                    $set: {
                        verification: guild.verification,
                    },
                }
            )
            .then(sendEmbed)
            .catch((e) => {
                console.error(e);
                command.editReply({
                    embeds: [generateErrorEmbed("Something went wrong...")],
                    components: [],
                });
            });

        function sendEmbed() {
            command.editReply({
                embeds: [generateSuccessEmbed("Role added!")],
                components: [],
            });
        }
    }
});

export default verificationAddMapperRole;
