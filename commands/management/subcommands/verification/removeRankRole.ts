import { PermissionFlagsBits, StringSelectMenuBuilder } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import truncateString from "../../../../helpers/text/truncateString";
import crypto from "crypto";

const verificationRemoveRankRole = new SlashCommandSubcommand(
    "rankrole",
    "Remove a rank role from the system",
    undefined,
    [PermissionFlagsBits.ManageGuild]
);

export interface IRankRole {
    id: string;
    type: "country" | "global";
    gamemode: string;
    min_rank: number;
    max_rank: number;
}

verificationRemoveRankRole.setExecuteFunction(async (command) => {
    if (!command.member || !command.guild || !command.client.user) return;

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    if (
        !guild.verification.targets.rank_roles ||
        guild.verification.targets.rank_roles.length == 0
    )
        return command.editReply({
            embeds: [generateErrorEmbed("No rank roles found.")],
        });

    const menu = new StringSelectMenuBuilder()
        .setMaxValues(guild.verification.targets.rank_roles.length)
        .setMinValues(1)
        .setOptions(
            guild.verification.targets.rank_roles.map(
                (role: IRankRole, i: number) => {
                    const nonce = crypto.randomBytes(10).toString("hex");
                    return {
                        label: `#${i + 1} | ${truncateString(
                            `@${
                                command.guild?.roles.cache.get(role.id)?.name ||
                                "@Deleted Role"
                            } | ${role.min_rank} -> ${role.max_rank} | ${
                                role.gamemode
                            }`,
                            100,
                            true
                        )}`,
                        value: `${nonce},role.id`,
                    };
                }
            )
        );

    generateStepEmbedWithChoices(
        command,
        "Select roles to remove",
        "You can select multiple roles",
        menu,
        undefined,
        true
    )
        .then((roles) => {
            if (!guild) return;

            for (const role of roles.data) {
                guild.verification.targets.rank_roles =
                    guild.verification.targets.rank_roles.filter(
                        (r: IRankRole) => r.id != role.slice(10)
                    );
            }

            guilds
                .findByIdAndUpdate(guild._id, guild)
                .then(() => {
                    command.editReply({
                        content: "",
                        embeds: [generateSuccessEmbed("Removed roles!")],
                        components: [],
                    });
                })
                .catch((e) => {
                    console.error(e);

                    command.editReply({
                        content: "",
                        embeds: [
                            generateErrorEmbed(
                                "Can't save your changes. Sorry..."
                            ),
                        ],
                        components: [],
                    });
                });
        })
        .catch((e) => {
            console.error(e);

            command.editReply({
                content: "",
                embeds: [
                    generateErrorEmbed(
                        "Time expired! Don't leave me waiting, please."
                    ),
                ],
            });
        });

    await guilds.findByIdAndUpdate(command.guildId, guild);
});

export default verificationRemoveRankRole;
