import { Client, EmbedBuilder } from "discord.js";
import colors from "../../constants/colors";
import getWebsiteStatus from "./../../helpers/general/getWebsiteStatus";
import { SlashCommand } from "../../models/commands/SlashCommand";
import axios from "axios";

const about = new SlashCommand(
    ["about", "info", "status"],
    "Get information about the bot.",
    "General",
    true
);

about.setExecuteFunction(async (command) => {
    const info = {
        bot: {
            invite: "https://discord.com/api/oauth2/authorize?client_id=937807478429745213&permissions=1256748215504&scope=bot%20applications.commands",
            github: "https://github.com/AxerBot/axer-bot",
            server: "https://discord.gg/MAsnz96qGy",
        },
        hivie: {
            discord: "<@341321481390784512>",
            osu: "https://osu.ppy.sh/users/14102976",
            github: "https://github.com/Hiviexd",
        },
        sebola: {
            discord: "<@556639598172962818>",
            osu: "https://osu.ppy.sh/users/15821708",
            github: "https://github.com/Sebola3461",
        },
    };

    function pingCDN() {
        return new Promise<boolean>((resolve, reject) => {
            axios(`${process.env.RATECHANGER_URL}/ping`)
                .then(() => resolve(true))
                .catch(() => resolve(false));
        });
    }

    const embed = new EmbedBuilder()
        .setTitle("ℹ️ About")
        .setDescription(
            `AxerBot is a feature-rich bot aimed for osu! mappers, modders, and players.\nCurrently serving \`${command.client.guilds.cache.size}\` servers!\nUse \`/help\` to get a full list of the available commands.`
        )
        .setColor(colors.blue)
        .addFields(
            {
                name: "Links",
                value: `[Add me](${info.bot.invite})\n[GitHub](${info.bot.github})\n[Support Server](${info.bot.server})`,
                inline: true,
            },
            {
                name: "Developers",
                value: `Hivie: ${info.hivie.discord} ([osu!](${info.hivie.osu}), [GitHub](${info.hivie.github}))\nSebola: ${info.sebola.discord} ([osu!](${info.sebola.osu}), [GitHub](${info.sebola.github}))`,
                inline: true,
            },
            {
                name: "Status",
                value: `Ping: \`${command.client.ws.ping} ms\`\nCDN (File Server): ${
                    (await pingCDN()) ? "🟢" : "🔴"
                }`,
            }
        );

    return command.editReply({
        embeds: [embed],
    });
});

export default about;
