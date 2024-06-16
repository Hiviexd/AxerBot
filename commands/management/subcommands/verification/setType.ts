import { SlashCommandStringOption } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import createNewGuild from "../../../../database/utils/createNewGuild";

const verificationSetType = new SlashCommandSubcommand()
    .setName("type")
    .setDescription("Disable or enable welcome message by changing system's type")
    .addOptions(
        new SlashCommandStringOption().setName("type").setDescription("System type").addChoices(
            {
                name: "default",
                value: "default",
            },
            {
                name: "static",
                value: "static",
            }
        )
    )
    .setPermissions("ModerateMembers");

verificationSetType.setExecutable(async (command) => {
    const type = command.options.getString("type", true);

    let guildData = await guilds.findById(command.guildId);

    if (!command.guild) return;

    if (!guildData) {
        guildData = await createNewGuild(command.guild);
    }

    if (!guildData)
        return command.editReply({
            embeds: [generateErrorEmbed("This guild isn't validated! Try again.")],
        });

    guildData.verification.isStatic = type == "static";
    await guilds.updateOne({ _id: guildData._id }, guildData);

    command.editReply({
        embeds: [
            generateSuccessEmbed(
                guildData.verification.isStatic
                    ? `Welcome messages disabled! If you don't have any static embed, use \`/verification new verifyembed\``
                    : `Welcome messages enabled again! Now the system will send messages on <#${guildData.verification.channel}>`
            ),
        ],
    });
});

export { verificationSetType };
