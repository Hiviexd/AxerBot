import { Client, Message } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import UserNotBNorNAT from "../../responses/qat/UserNotBNorNAT";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";

export default {
	name: "bn",
	help: {
		description: "Fetches data of a BN/NAT from the last 90 days",
		example: "{prefix}bn Hivie",
	},
	category: "BNsite",
	run: async (bot: Client, message: Message, args: string[]) => {
		let { playerName, status } = await checkMessagePlayers(message, args);

		if (status != 200) return;

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
        
        message.channel.sendTyping();
       const userActivity = await qatApi.fetch.userActivity(osuUser.data.id, 90); //? 90 days

       if (userActivity.status != 200)
            return message.channel.send({
                embeds: [UserNotFound],
            });

        const activityRes = userActivity.data;
        console.log(activityRes);
        //TODO: do stuff with data
	},
};
