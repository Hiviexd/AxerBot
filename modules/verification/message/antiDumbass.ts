import { Message } from "discord.js";
import { guilds } from "../../../database";
import generateErrorEmbedWithTitle from "../../../helpers/text/embeds/generateErrorEmbedWithTitle";

export async function antiDumbass(message: Message) {
    const guild = await guilds.findById(message.guildId);

    if (!guild) return;

    if (!guild.verification.enable) return;

    if (guild.verification.channel != message.channel.id) return;

    if (!message.content.includes("!verify")) return;

    message
        .reply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "🛑 Alert",
                    "Please click on the green button and do the proccess. **NEVER SHARE YOUR VERIFICATION CODE**"
                ),
            ],
            options: {
                ephemeral: true,
            },
        })
        .then((r) => {
            message
                .delete()
                .then(() => {
                    setTimeout(() => {
                        r.delete().catch(console.error);
                    }, 10000);
                })
                .catch(console.error);
        });
}
