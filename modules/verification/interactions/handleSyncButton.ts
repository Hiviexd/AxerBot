import { ButtonInteraction, Guild, GuildMember } from "discord.js";
import { verifications, users } from "../../../database";
import createNewUser from "../../../database/utils/createNewUser";
import generateErrorEmbed from "../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../helpers/text/embeds/generateSuccessEmbed";
import UserNotFound from "../../../responses/embeds/UserNotFound";
import osuApi from "../../osu/fetcher/osuApi";
import { VerificationType } from "../client/GenerateAuthToken";
import { runVerificationChecks } from "../client/runVerificationChecks";
import { sendFirstTimeVerificationSync } from "../client/sendFirstTimeVerificationSync";

export async function handleSyncButton(button: ButtonInteraction) {
    try {
        if (!button.guild) return;

        if (button.customId.split(",")[0] != "syncprofile") return;

        await button.deferReply({ ephemeral: true });

        const pendingVerifications = await verifications.find({
            target_user: button.user.id,
            target_guild: button.guild.id,
            type: VerificationType.default,
        });

        if (pendingVerifications.length != 0)
            return button.editReply({
                embeds: [
                    generateErrorEmbed(
                        "You can't run this function now! You have pending verifications here. Please, verify your user before run this command! If you think this is a mistake, just leave and join this server."
                    ),
                ],
            });

        let user = await users.findById(button.user.id);

        if (!user) user = await createNewUser(button.user);

        if (!user) return;

        if (!user.verified_id) return sendFirstTimeVerificationSync(button);

        const userData = await osuApi.fetch.user(user.verified_id.toString());

        if (!userData || userData.status != 200 || !userData.data)
            return button.editReply({
                embeds: [UserNotFound],
            });

        runVerificationChecks(
            button.guild as Guild,
            userData.data,
            button.member as GuildMember
        )
            .then(() => {
                button.editReply({
                    content: `<@${button.user.id}>`,
                    embeds: [generateSuccessEmbed("Your data is updated!")],
                });
            })
            .catch((e) => {
                console.error(e);
                button.editReply({
                    embeds: [generateErrorEmbed("Something went wrong...")],
                });
            });
    } catch (e) {
        console.error(e);
        button.editReply({
            embeds: [generateErrorEmbed()],
        });
    }
}
