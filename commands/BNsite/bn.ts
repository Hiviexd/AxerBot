import { Client, ChatInputCommandInteraction } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import UserNotBNorNAT from "../../responses/qat/UserNotBNorNAT";
import osuApi from "../../modules/osu/fetcher/osuApi";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import checkCommandPlayers from "../../helpers/osu/player/checkCommandPlayers";
import BNEmbed from "../../responses/qat/BNEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";

const bn = new SlashCommand(
    ["bn", "nat"],
    "Displays nominator data of a BN/NAT from the last 90 days",
    "BN website",
    true,
    {
        note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
    }
);

bn.builder.addStringOption((o) =>
    o.setName("username").setDescription("osu! username")
);

bn.setExecuteFunction(async (command) => {
    // ? prevent errors

    let { playerName, status } = await checkCommandPlayers(command);

    if (status != 200) return;

    // fetch user from osu api to get their id
    const osuUser = await osuApi.fetch.user(encodeURI(playerName));

    if (osuUser.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
        });

    // use id from before to fetch qatUser
    const qatUser = await qatApi.fetch.user(osuUser.data.id);

    if (qatUser.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
        });

    const userRes = qatUser.data;
    if (!userRes.groups.find((g) => ["bn", "nat"].includes(g))) {
        return command.editReply({
            embeds: [UserNotBNorNAT],
        });
    }

    const qatUserActivity = await qatApi.fetch.userActivity(
        osuUser.data.id,
        90
    ); //? 90 days

    if (qatUserActivity.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
        });

    BNEmbed.reply(osuUser, qatUser, qatUserActivity, command);
});

export default bn;
