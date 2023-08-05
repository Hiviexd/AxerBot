import qatApi from "../../../../helpers/qat/fetcher/qatApi";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import checkCommandPlayers from "../../../../modules/osu/player/checkCommandPlayers";
import UserNotFound from "../../../../responses/embeds/UserNotFound";
import BNEmbed from "../../../../responses/qat/BNEmbed";
import UserNotBNorNAT from "../../../../responses/qat/UserNotBNorNAT";

const bnInfo = new SlashCommandSubcommand(
    "info",
    "Displays nominator data of a BN/NAT from the last 90 days",
    {
        note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
    }
);

bnInfo.builder.addStringOption((o) => o.setName("username").setDescription("osu! username"));

bnInfo.setExecuteFunction(async (command) => {
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

    const qatUserActivity = await qatApi.fetch.userActivity(osuUser.data.id, 90); //? 90 days

    if (qatUserActivity.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
        });

    BNEmbed.reply(osuUser, qatUser, qatUserActivity, command);
});

export default bnInfo;
