import { Guild, GuildMember } from "discord.js";
import { users, verifications } from "../../../../database";
import createNewUser from "../../../../database/utils/createNewUser";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { runVerificationChecks } from "../../../../modules/verification/client/runVerificationChecks";
import { sendFirstTimeVerificationSync } from "../../../../modules/verification/client/sendFirstTimeVerificationSync";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import UserNotFound from "../../../../responses/embeds/UserNotFound";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { VerificationType } from "../../../../modules/verification/client/GenerateAuthToken";

const verificationSync = new SlashCommandSubcommand("sync", "Sync your verified data!");

verificationSync.setExecuteFunction(async (command) => {
    try {
        if (!command.guild) return;

        const pendingVerifications = await verifications.find({
            target_user: command.user.id,
            target_guild: command.guild.id,
            type: VerificationType.default,
        });

        if (pendingVerifications.length != 0)
            return command.editReply({
                embeds: [
                    generateErrorEmbed(
                        "You can't run this command now! You have pending verifications here. Please, verify your user before run this command! If you think this is a mistake, just leave and join this server."
                    ),
                ],
            });

        let user = await users.findById(command.user.id);

        if (!user) user = await createNewUser(command.user);

        if (!user) return;

        if (!user.verified_id) return sendFirstTimeVerificationSync(command);

        const userData = await osuApi.fetch.user(user.verified_id.toString());

        if (!userData || userData.status != 200 || !userData.data)
            return command.editReply({
                embeds: [UserNotFound],
            });

        runVerificationChecks(command.guild as Guild, userData.data, command.member as GuildMember)
            .then(() => {
                command.editReply({
                    content: `<@${command.user.id}>`,
                    embeds: [generateSuccessEmbed("Your data is updated!")],
                });
            })
            .catch((e) => {
                console.error(e);
                command.editReply({
                    embeds: [generateErrorEmbed("Something went wrong...")],
                });
            });
    } catch (e) {
        console.error(e);
        command.editReply({
            embeds: [generateErrorEmbed()],
        });
    }
});

export default verificationSync;
