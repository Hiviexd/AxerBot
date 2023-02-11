import {
	Interaction,
	MessageActionRow,
	MessageButton,
	EmbedBuilder,
} from "discord.js";
import { users, verifications } from "../../database";
import createNewUser from "../../database/utils/createNewUser";
import { IVerificationObject } from "../../modules/verification/client/GenerateAuthToken";
import colors from "../../constants/colors";
import getWebsiteStatus from "../../helpers/general/getWebsiteStatus";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export default async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    const targets = interaction.customId.split("|");

    if (targets[0] != "verification") return;

    if (interaction.user.id != targets[1])
        return interaction.editReply({
            content: `**You're not allowed to use this!**`,
        });

    if (!interaction.guild) return;
    // if (await getWebsiteStatus("https://axer-auth.ppy.tn") === 502) return interaction.editReply({
    //     embeds: [generateErrorEmbed("The verification server is down. Please try again later, or contact a server moderator to manually verify you.")]
    // });

    let targetVerification = await verifications.findById(targets[2]);

    if (!targetVerification)
        return interaction.editReply({
            content: `**You don't have any pending verification here... If this is an error, leave and join the server again!**`,
        });

    const embed = new MessageEmbed({
        title: "🔍 Verify your account!",
        description: `To verify your account, use \`!verify <code>\` [here](https://osu.ppy.sh/home/messages/users/${process.env.IRC_OSU_ID})`,
        fields: [
            {
                name: "Your code is",
                value: targetVerification.code,
            },
        ],
        thumbnail: {
            url: interaction.guild.iconURL() || "",
        },
        color: colors.yellow,
    });

    const buttons = new MessageActionRow();
    buttons.addComponents([
        new MessageButton({
            style: "LINK",
            url: `https://osu.ppy.sh/home/messages/users/${process.env.IRC_OSU_ID}`,
            label: "Verify my account",
        }),
    ]);

    interaction.editReply({
        embeds: [embed],
        components: [buttons],
    });
};
