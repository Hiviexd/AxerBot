import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetButton = new SlashCommandSubcommand(
    "button",
    "Enable or disable verification interaction button",
    false,
    {
        syntax: "/verification `set` `status`",
        example: "/verification `set` `status:disabled`",
    },
    [PermissionFlagsBits.ManageGuild]
);

verificationSetButton.builder.addStringOption((o) =>
    o
        .setName("status")
        .setDescription("Enable or disable the button")
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

verificationSetButton.setExecuteFunction(async (command) => {
    if (typeof command.member?.permissions == "string") return;

    let guild = await guilds.findById(command.guildId);

    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    const status = command.options.getString("status", true);

    status == "true"
        ? (guild.verification.button = true)
        : (guild.verification.button = false);

    await guilds.findByIdAndUpdate(guild._id, guild);

    return command.editReply({
        embeds: [
            generateSuccessEmbed(
                `Verification button ${
                    status == "true" ? "enabled" : "disabled"
                }!`
            ),
        ],
    });
});

export default verificationSetButton;
