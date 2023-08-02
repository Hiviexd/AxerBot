import { EmbedBuilder, Guild, PermissionFlagsBits } from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { generateConfirmEmbedWithChoices } from "../../../../helpers/commands/generateConfirmEmbedWithChoices";
import { guildUserAccountBans } from "../../../../database";
import { randomUUID } from "crypto";
import colors from "../../../../constants/colors";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import logRestrictionAdd from "../../../../modules/loggers/logRestrictionAdd";
import { GuildUserBans } from "../../../../database/schemas/guildUserBans";
import logRestrictionKick from "../../../../modules/loggers/logRestrictionKick";

const verificationBanUser = new SlashCommandSubcommand(
    "user",
    "Ban an osu account from the server",
    {
        "What is it?":
            "A banned account can't pass into verification system and is automatically kicked from the server if the user tries to verify again",
    },
    [PermissionFlagsBits.BanMembers]
);

verificationBanUser.builder
    .addNumberOption((o) =>
        o.setName("osu_account_id").setDescription("Account id to ban").setRequired(true)
    )
    .addUserOption((o) =>
        o.setName("kick_member").setDescription("Default discord kick").setRequired(false)
    )
    .addStringOption((o) =>
        o.setName("reason").setDescription("Ban reason").setMaxLength(50).setRequired(false)
    );

verificationBanUser.setExecuteFunction(async (command) => {
    const accountId = Math.round(command.options.getNumber("osu_account_id", true));
    const banMember = command.options.getUser("kick_member");
    const reason = command.options.getString("reason");

    if (isNaN(accountId))
        return command.editReply({
            embeds: [generateErrorEmbed("Invalid account id!")],
        });

    const currentBanHere = await guildUserAccountBans.findOne({
        userId: String(accountId),
        guildId: command.guildId,
    });

    if (currentBanHere)
        return command.editReply({
            embeds: [generateErrorEmbed("This user is already restricted here!")],
        });

    const currentBans = await guildUserAccountBans.countDocuments({
        guildId: command.guildId,
    });

    if (currentBans >= 100)
        return command.editReply({
            embeds: [generateErrorEmbed("You can't restrict more than 100 users!")],
        });

    await generateConfirmEmbedWithChoices(
        command,
        "⚠️ Are you sure?",
        `Any Discord account verified with the id \`${accountId}\` can't be verified on this server!`,
        [],
        handleBan
    );

    async function handleBan() {
        if (!command.guild) return;

        const newRestriction = await guildUserAccountBans.create({
            _id: randomUUID(),
            authorId: command.user.id,
            createdAt: new Date(),
            guildId: command.guildId,
            userId: String(accountId),
            reason: reason ? reason.trim() : null,
        });

        banMember
            ? command.guild.members
                  .fetch(banMember.id)
                  .then(async (member) => {
                      member
                          .kick()
                          .then(() => {
                              handleSuccess(true, newRestriction);
                              logRestrictionKick(member, newRestriction as any);
                          })
                          .catch(() => handleSuccess(false, newRestriction));
                  })
                  .catch(() => handleSuccess(false, newRestriction))
            : handleSuccess(false, newRestriction);
    }

    async function handleSuccess(discordBanned: boolean, restriction: any) {
        const description = discordBanned
            ? `User \`${accountId}\` is kicked and restricted here!`
            : banMember
            ? `User \`${accountId}\` is restricted but can't be Discord kicked by me! This can happens by permission issues but you can ban member ${banMember} by hand.`
            : `User \`${accountId}\` is restricted here!`;

        logRestrictionAdd(command.guild as Guild, restriction);

        const embed = new EmbedBuilder()
            .setTitle("✅ Success!")
            .setDescription(description)
            .setColor(colors.green);

        command.editReply({
            embeds: [embed],
            components: [],
        });
    }
});

export default verificationBanUser;
