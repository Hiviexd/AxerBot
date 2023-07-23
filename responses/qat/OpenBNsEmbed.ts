import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { QatAllUsersResponse, QatUser } from "../../types/qat";
import getOpenBNsPerMode from "../../helpers/qat/getters/requestStatus/getOpenBNsPerMode";
import colors from "../../constants/colors";

export default {
    reply: (
        qatAllUsers: QatAllUsersResponse,
        gamemode: string | undefined,
        command: ChatInputCommandInteraction
    ) => {
        let openBNs: QatUser[] = [];

        qatAllUsers.data.forEach((user: QatUser) => {
            if (!user.requestStatus.includes("closed") && user.requestStatus.length > 0) {
                openBNs.push(user);
            }
        });

        let e = new EmbedBuilder().setColor(colors.qat);
        //.setDescription(`According to the **[BN/NAT website](https://bn.mappersguild.com/)**`);

        if (gamemode) {
            e.setAuthor({
                name: `${getOpenBNsPerMode(openBNs, gamemode, "status", true)} open osu!${
                    gamemode === "osu" ? "" : gamemode
                } BNs`,
                url: `https://bn.mappersguild.com/modrequests`,
                iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
            })
                .setDescription(`${getOpenBNsPerMode(openBNs, gamemode, "status")}`)
                .setFooter({
                    text: `use \"/openbns\" to view all open BNs.`,
                });
        } else {
            e.setAuthor({
                name: `${openBNs.length} open BNs`,
                url: "https://bn.mappersguild.com/modrequests",
                iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
            })
                .addFields(
                    {
                        name: `osu! (${getOpenBNsPerMode(openBNs, "osu", "link", true)})`,
                        value: `${getOpenBNsPerMode(openBNs, "osu", "link")}`,
                        inline: true,
                    },
                    {
                        name: `osu!taiko (${getOpenBNsPerMode(openBNs, "taiko", "link", true)})`,
                        value: `${getOpenBNsPerMode(openBNs, "taiko", "link")}`,
                        inline: true,
                    },
                    {
                        name: `osu!mania (${getOpenBNsPerMode(openBNs, "mania", "link", true)})`,
                        value: `${getOpenBNsPerMode(openBNs, "mania", "link")}`,
                        inline: true,
                    },
                    {
                        name: `osu!catch (${getOpenBNsPerMode(openBNs, "catch", "link", true)})`,
                        value: `${getOpenBNsPerMode(openBNs, "catch", "link")}`,
                        inline: true,
                    }
                )
                .setFooter({
                    text: `use \"/openbns <gamemode>\" to view more details.`,
                });
        }
        command.editReply({ embeds: [e] });
    },
};
