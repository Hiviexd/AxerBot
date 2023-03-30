import {
    ActionRowBuilder,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
} from "discord.js";

import { guilds } from "../../../../database";
import createNewGuild from "../../../../database/utils/createNewGuild";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import generateWaitEmbed from "../../../../helpers/text/embeds/generateWaitEmbed";
import { IMapperRole } from "./addMapperRole";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

const verificationRemoveMapperRole = new SlashCommandSubcommand(
    "mapperrole",
    "Remove a mapper role",
    undefined,
    [PermissionFlagsBits.ManageGuild]
);

verificationRemoveMapperRole.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    let guild = await guilds.findById(command.guild.id);

    if (!guild) guild = await createNewGuild(command.guild);
    if (!guild) return;

    if (!guild.verification.mapper_roles) guild.verification.mapper_roles = [];

    if (guild.verification.mapper_roles.length == 0)
        return command.editReply({
            embeds: [
                generateWaitEmbed(
                    "Error",
                    "You need to add a Mapper Role before use this command."
                ),
            ],
        });

    const mapperTitles: { [key: string]: string } = {
        r: `Ranked Mappers`,
        l: `Loved Mappers`,
        a: `Unranked Mappers`,
    };

    const menu = new StringSelectMenuBuilder().setOptions(
        guild.verification.mapper_roles.map((r: IMapperRole, i: number) => {
            return {
                label: `${mapperTitles[r.target]} | ${
                    r.modes ? r.modes.join(", ") : "none"
                } | ${r.roles.map((r) =>
                    command.guild?.roles.cache.get(r)?.name
                        ? `@${command.guild?.roles.cache.get(r)?.name}`
                        : "Unknown Role"
                )}`,
                value: `${i}`,
            };
        })
    );

    menu.setMaxValues(guild.verification.mapper_roles.length);

    generateStepEmbedWithChoices(
        command,
        "Remove a Mapper Role",
        "Select below how many roles you want to remove",
        menu,
        undefined,
        true
    )
        .then((r) => {
            const roles = r.data;

            roles.forEach((r) => {
                if (!guild) return;
                guild.verification.mapper_roles.splice(Number(r), 1);
            });

            sendSuccess();
        })
        .catch((e) => {
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

    function sendSuccess() {
        if (!guild) return;

        guilds
            .updateOne(
                { _id: guild._id },
                {
                    $set: {
                        verification: guild.verification,
                    },
                }
            )
            .then(() => {
                command.editReply({
                    content: "",
                    embeds: [generateSuccessEmbed("Roles removed!")],
                });
            })
            .catch((e) => {
                console.error(e);
                command.editReply({
                    content: "",
                    embeds: [generateErrorEmbed("Something went wrong!")],
                });
            });
    }
});

export default verificationRemoveMapperRole;
