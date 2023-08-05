import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
} from "discord.js";
import GenerateAuthToken, { VerificationType } from "./GenerateAuthToken";
import generateErrorEmbed from "../../../helpers/text/embeds/generateErrorEmbed";
import colors from "../../../constants/colors";

export async function sendAccountValidation(
    command: ChatInputCommandInteraction | ButtonInteraction
) {
    try {
        const token = await GenerateAuthToken(
            command.member as GuildMember,
            VerificationType.accountVerification
        );

        if (token.status != 200 || !token.data)
            return command.editReply({
                embeds: [generateErrorEmbed("Something went wrong. Try again later.")],
            });

        const embed = new EmbedBuilder({
            title: "🔐 Validate your account",
            description: `This is your first time validating your account, you just need to do this **ONE** time.\nTo verify with your osu! account, send the command below in the bot's osu! PMs, you can go there by clicking [here](https://osu.ppy.sh/home/messages/users/${process.env.IRC_OSU_ID}), or by clicking the button below.\n\n**Do NOT reveal this command to the public, as it can risk your identity being compromised on this server!**`,
            fields: [
                {
                    name: "Copy and paste this:",
                    value: `\`!verify ${token.data.code}\``,
                },
            ],
        }).setColor(colors.yellow);

        const buttons = new ActionRowBuilder<ButtonBuilder>();
        buttons.addComponents([
            new ButtonBuilder({
                style: ButtonStyle.Link,
                url: `https://osu.ppy.sh/home/messages/users/${process.env.IRC_OSU_ID}`,
                label: "Verify my account",
            }),
        ]);

        command.followUp({
            embeds: [embed],
            components: [buttons],
            ephemeral: true,
            target: command.user,
        });
    } catch (e) {
        console.error(e);
        command.editReply({
            embeds: [generateErrorEmbed("Something went wrong...")],
        });
    }
}
