import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetFlags = new SlashCommandSubcommand(
    "flag",
    "Set which data that will be replaced with the osu! user data.",
    {
        syntax: "/verification `set flags` `flag:<flag>` `status:<enable|disable>`",
        example: "/verification `set flags` `flag:username` `status:enable`",
        "avaliable flags": [
            "`username, <enable|disable>`: Set the user's discord nickname to match their osu! username",
            "`country_role, <enable|disable>`: Add a role with user's country name to the user",
        ],
    },
    [PermissionFlagsBits.ManageGuild]
);

verificationSetFlags.builder
    .addStringOption((o) =>
        o.setName("flag").setDescription("What do you want to manage?").addChoices(
            {
                name: "username",
                value: "username",
            },
            {
                name: "country_role",
                value: "country_role",
            },
            {
                name: "country_role_icons",
                value: "country_role_icons",
            }
        )
    )
    .addStringOption((o) =>
        o.setName("status").setDescription("Set status").addChoices(
            {
                name: "enabled",
                value: "true",
            },
            {
                name: "disabled",
                value: "false",
            }
        )
    );

verificationSetFlags.setExecuteFunction(async (command) => {
    if (!command.member || !command.guild) return;

    if (typeof command.member?.permissions == "string") return;

    const flag = command.options.getString("flag", true);
    const status = command.options.getString("status", true) == "true" ? true : false;

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds..."
                ),
            ],
        });

    if (flag == "country_role_icons" && !command.guild.features.includes("ROLE_ICONS"))
        return command.editReply({
            embeds: [generateErrorEmbed("This flag can't be enabled here!")],
        });

    guild.verification.targets[flag] = status;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Flag updated!")],
    });
});

export default verificationSetFlags;
