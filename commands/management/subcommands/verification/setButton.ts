import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetButton = new SlashCommandSubcommand(
    "channel",
    "Sets the channel for the system",
    false,
    {
        syntax: "/verification `set channel` `text_channel:<channel>`",
        example: "/verification `set channel` `text_channel:#arrival`",
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

    await command.deferReply();

    let guild = await guilds.findById(command.guildId);

    if (!guild)
        return command.editReply(
            "This guild isn't validated, try again after some seconds.."
        );

    const status = command.options.getString("status", true);

    status == "true"
        ? (guild.verification.button = true)
        : (guild.verification.button = false);

    await guilds.findByIdAndUpdate(guild._id, guild);

    return command.editReply({
        embeds: [
            generateSuccessEmbed(
                `The verification button has been ${
                    status == "true" ? "enabled" : "disabled"
                }!`
            ),
        ],
    });
});

export default verificationSetButton;
