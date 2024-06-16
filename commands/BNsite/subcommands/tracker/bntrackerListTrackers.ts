import { EmbedBuilder } from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import colors from "../../../../constants/colors";
import { tracks } from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

const bntrackerListTrackers = new SlashCommandSubcommand()
    .setName("list")
    .setDescription("List of all active trackers in this server")
    .setPermissions("ManageChannels");

bntrackerListTrackers.setExecutable(async (command) => {
    if (!command.member) return;

    const guildTrackers = await tracks.find({
        guild: command.guildId,
        type: "qat",
    });

    if (guildTrackers.length == 0)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This server doesn't have any tracker configured. Use `/bntrack add tracker` to add a tracker."
                ),
            ],
        });

    function getStatus(track: any) {
        const status: string[] = [];
        const texts = ["open", "closed"];

        for (let i = 0; i < 2; i++) {
            if (track.targets[texts[i]] == true) status.push(texts[i]);
        }

        return status.join(",");
    }

    const embed = new EmbedBuilder()
        .setTitle("Current BN trackers")
        .setDescription(
            `${guildTrackers
                .map((t) => {
                    return `<#${t.channel}> [${t.targets.modes.join(",")}] (${getStatus(t)})`;
                })
                .join("\n")}`
        )
        .setColor(colors.qat)
        .setFooter({
            text: "BN website",
            iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
        });

    command.editReply({
        embeds: [embed],
    });
});

export { bntrackerListTrackers };
