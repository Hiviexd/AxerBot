import * as cron from "node-cron";
import { kudosuUsers } from "../../../database";
import { consoleCheck, consoleError, consoleLog } from "../../../helpers/core/logger";
import { randomUUID } from "crypto";
import osuApi from "../../osu/fetcher/osuApi";

export const updateKudosuRankings = cron.schedule(
    "0 */1 * * *",
    async () => {
        const pages = 20;

        consoleLog("cron", "Updating kudosu rankings...");

        for (let i = 1; i <= pages; i++) {
            const rankings = await osuApi.fetch.kudosuRankings(i);

            if (rankings.status != 200) {
                consoleError("cron", "Error while fetching kudosu rankings:");
                console.error(rankings.data);

                return;
            }

            const users = rankings.data;

            for (const user of users) {
                const userDb = await kudosuUsers.findOne({ osuId: user.id });

                if (!userDb) {
                    await kudosuUsers.create({
                        _id: randomUUID(),
                        avatar_url: user.avatar_url,
                        osuId: user.id,
                        username: user.username,
                        rank: users.indexOf(user) + 1 + (i - 1) * 50,
                        kudosu: user.kudosu?.total,
                        updatedAt: new Date(),
                    });
                } else {
                    userDb.avatar_url = user.avatar_url;
                    userDb.username = user.username;
                    userDb.kudosu = user.kudosu?.total;
                    userDb.rank = users.indexOf(user) + 1 + (i - 1) * 50;
                    userDb.updatedAt = new Date();

                    await userDb.save();
                }
            }

            //sleep for 1 second
            await new Promise((resolve) => setTimeout(resolve, 1000));

            consoleCheck("cron", `Updated kudosu rankings page ${i}/${pages}`);
        }

        consoleCheck("cron", "Updated all kudosu rankings!");
    },
    {
        scheduled: false, // needs to be false so it can start manually
    }
);
