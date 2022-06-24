import { Client, Message } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import UserNotBNorNAT from "../../responses/qat/UserNotBNorNAT";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";
import BNEmbed from "../../responses/qat/BNEmbed";

export default {
	name: "bn",
	help: {
		description: "Displays nominator data of a BN/NAT from the last 90 days",
		example: "{prefix}bn\n{prefix}bn `Hivie`\n{prefix}bn <@341321481390784512>\n{prefix}bn `HEAVENLY MOON`",
        note: "You won't need to specify your username if you set yourself up with this command:\n`{prefix}osuset user <username>`",
	},
	category: "BNsite",
	run: async (bot: Client, message: Message, args: string[]) => {
		let { playerName, status } = await checkMessagePlayers(message, args);

		if (status != 200) return;

        message.channel.sendTyping();

		// fetch user from osu api to get their id
        const osuUser = await osuApi.fetch.user(encodeURI(playerName));

		if (osuUser.status != 200)
			return message.channel.send({
				embeds: [UserNotFound],
			});

        // use id from before to fetch qatUser
            const qatUser = await qatApi.fetch.user(osuUser.data.id);
        
        if (qatUser.status != 200)
            return message.channel.send({
                embeds: [UserNotFound],
            });
        
        const userRes = qatUser.data;
        if (!userRes.groups.find((g) => ["bn", "nat"].includes(g))) {
            return message.channel.send({
                embeds: [UserNotBNorNAT],
            });
        }
        
       const qatUserActivity = await qatApi.fetch.userActivity(osuUser.data.id, 90); //? 90 days

       if (qatUserActivity.status != 200)
            return message.channel.send({
                embeds: [UserNotFound],
            });

        BNEmbed.send(osuUser, qatUser, qatUserActivity, message);
	},
};
