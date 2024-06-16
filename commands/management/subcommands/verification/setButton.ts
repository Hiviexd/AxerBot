import { PermissionFlagsBits, SlashCommandStringOption } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetButton = new SlashCommandSubcommand()
    .setName("button")
    .setDescription("Enable or disable verification interaction button")
    .addOptions(
        new SlashCommandStringOption()
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
    )
    .setPermissions("ModerateMembers");

verificationSetButton.setExecutable(async (command) => {
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

    status == "true" ? (guild.verification.button = true) : (guild.verification.button = false);

    await guilds.findByIdAndUpdate(guild._id, guild);

    return command.editReply({
        embeds: [
            generateSuccessEmbed(
                `Verification button ${status == "true" ? "enabled" : "disabled"}!`
            ),
        ],
    });
});

export { verificationSetButton };
