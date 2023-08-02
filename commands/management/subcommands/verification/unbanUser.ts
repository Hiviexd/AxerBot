import { EmbedBuilder, Guild, GuildMember, PermissionFlagsBits } from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { generateConfirmEmbedWithChoices } from "../../../../helpers/commands/generateConfirmEmbedWithChoices";
import { guildUserAccountBans } from "../../../../database";
import { randomUUID } from "crypto";
import colors from "../../../../constants/colors";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import logRestrictionRemove from "../../../../modules/loggers/logRestrictionRemove";

const verificationUnbanUser = new SlashCommandSubcommand(
    "remove",
    "Unban an osu account from the server",
    {
        "What is it?":
            "A banned account can't pass into verification system and is automatically kicked from the server if the user tries to verify again",
    },
    [PermissionFlagsBits.BanMembers]
);

verificationUnbanUser.builder.addNumberOption((o) =>
    o.setName("osu_account_id").setDescription("Account id to ban").setRequired(true)
);

verificationUnbanUser.setExecuteFunction(async (command) => {
    const accountId = Math.round(command.options.getNumber("osu_account_id", true));

    const currentBanHere = await guildUserAccountBans.findOne({
        userId: String(accountId),
        guildId: command.guildId,
    });

    if (!currentBanHere)
        return command.editReply({
            embeds: [generateErrorEmbed("This user isn't restricted here!")],
        });

    await generateConfirmEmbedWithChoices(
        command,
        "⚠️ Are you sure?",
        `You're about to unban the user \`${accountId}\``,
        [],
        handleUnban
    );

    async function handleUnban() {
        if (!command.guild || !currentBanHere) return;

        await currentBanHere
            .delete()
            .then(() => handleResult())
            .catch((e: any) =>
                command.editReply({
                    embeds: [generateErrorEmbed(`Something went wrong: ${e.message}`)],
                })
            );
    }

    async function handleResult() {
        const embed = new EmbedBuilder()
            .setTitle("✅ Success!")
            .setDescription(`User \`${accountId}\` is unrestricted here now!`)
            .setColor(colors.green);

        logRestrictionRemove(
            command.guild as Guild,
            command.member as GuildMember,
            String(accountId)
        );

        command.editReply({
            embeds: [embed],
            components: [],
        });
    }
});

export default verificationUnbanUser;
