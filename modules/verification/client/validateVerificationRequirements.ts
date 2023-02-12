import { guilds, users, verifications } from "../../../database";
import { bot } from "../../../";
// import { sendVerifiedEmbed } from "./sendVerifiedEmbed";
import { User, UserGroup } from "../../../types/user";
import osuApi from "../../../helpers/osu/fetcher/osuApi";
import { PrivateMessage } from "bancho.js";
import { sendVerifiedEmbed } from "../../../responses/verification/sendVerifiedEmbed";
import { sendLoggingEmbed } from "../../../responses/verification/sendLoggerEmbed";
import { consoleCheck, consoleLog } from "../../../helpers/core/logger";

export default async (
    user: User,
    _guild: string,
    _member: string,
    verificationId: string,
    pm: PrivateMessage
) => {
    try {
        const guild = await bot.guilds.fetch(_guild);

        if (!guild)
            return {
                status: 404,
                message: "Guild not found!",
            };

        const member = await guild.members.fetch({ user: _member });

        if (!member)
            return {
                status: 404,
                message: "Member not found!",
            };

        consoleLog(
            "Verification",
            `Validating user ${member.user.tag} in ${member.guild.name}`
        );

        const guild_db = await guilds.findById(guild.id);

        if (!guild_db)
            return {
                status: 404,
                message: "Guild not found in db!",
            };

        if (guild_db.verification.targets.username) {
            member
                .edit({
                    nick: user.username,
                    reason: "AxerBot Verification System",
                })
                .catch(console.error); // ? Sync username to osu! username
        }

        addRankRoles();

        for (const _role of guild_db.verification.targets.default_roles) {
            try {
                const role = await guild.roles.fetch(_role);

                if (role) {
                    await member.roles.add(role);
                }
            } catch (e: any) {
                console.error("adding default role", e.roles[0]);
            }
        }

        const probationaryRoles = ["PBN"];
        if (user.groups) {
            for (const group of user.groups) {
                addRole(group.short_name, group, group.is_probationary);
            }
        }

        async function addRole(
            role: string,
            usergroup: UserGroup,
            probationary: boolean
        ) {
            if (!guild_db) return;

            console.log(`adding ${role}`);
            const configuration =
                guild_db.verification.targets.group_roles.find(
                    (r: any) => r.group == (probationary ? `P${role}` : role)
                );

            if (!configuration) {
                console.log(`stop on configuration ${role}`);
                return;
            }

            if (
                configuration.modes.includes("none") &&
                usergroup.has_playmodes
            ) {
                console.log(`stop on none playmodes ${role}`);
                return;
            }

            if (!hasRequiredPlaymodes()) {
                console.log(`stop on required playmodes ${role}`);
                return;
            }

            try {
                const guildRole = guild.roles.cache.get(configuration.id);

                if (guildRole) {
                    try {
                        await member.roles.add(guildRole);
                    } catch (e: any) {
                        console.error(
                            `adding guild group role ${role} ${guildRole.id}`,
                            e
                        );
                    }
                } else {
                    console.log(`Role for ${role} not found`);
                }
            } catch (e: any) {
                console.error(`adding group role ${role}`, e);
            }

            function hasRequiredPlaymodes() {
                let r = false;

                if (
                    configuration.modes.includes("none") &&
                    usergroup.playmodes.length == 0
                )
                    return true;

                if (configuration.modes.length == 0) return true;

                usergroup.playmodes.forEach((m) => {
                    if (configuration.modes.includes(m)) r = true;
                });

                return r;
            }
        }

        /**
         * TODO: Typing
         */

        function addRankRoles() {
            if (!guild_db) return;

            const roles = guild_db.verification.targets.rank_roles;

            if (!roles || roles.length == 0)
                return console.log("Server without configuration");

            roles.forEach((r: any) => execute(r));

            async function execute(r: any) {
                const role = guild.roles.cache.get(r.id);

                if (!role) return console.log("Role not found!");

                if (!user.statistics) return console.log("User without rank");

                const osu = await osuApi.fetch.user(
                    user.id.toString(),
                    r.gamemode
                );

                if (osu.status != 200 || !osu.data)
                    return console.log("Osu user not found!");

                const osuData: User = osu.data;

                if (!osuData.statistics)
                    return console.log("User without statistics!");

                if (
                    (r.type == "country" && !osuData.statistics.country_rank) ||
                    (r.type == "country" &&
                        osuData.statistics.country_rank == 0)
                )
                    return console.log("User without valid rank (country)!");

                if (
                    (r.type == "global" && !osuData.statistics.global_rank) ||
                    (r.type == "global" && osuData.statistics.global_rank == 0)
                )
                    return console.log("User without valid rank (global)!");

                try {
                    if (r.type == "global") {
                        if (
                            osuData.statistics.global_rank <= r.max_rank &&
                            osuData.statistics.global_rank >= r.min_rank
                        )
                            return member.roles.add(role);
                    }

                    if (r.type == "country") {
                        if (
                            osuData.statistics.country_rank <= r.max_rank &&
                            osuData.statistics.country_rank >= r.min_rank
                        )
                            return member.roles.add(role);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }

        sendVerifiedEmbed(user, guild, member, guild_db);
        sendLoggingEmbed(user, guild, member, guild_db);

        await verifications.deleteOne({
            _id: verificationId,
        });

        await users.findByIdAndUpdate(member.user.id, {
            $set: {
                osu: {
                    username: user.id,
                },
            },
        });

        pm.user.sendMessage(
            `[BOT]: You're verified! Welcome to ${guild.name}.`
        );

        consoleCheck(
            "Verification",
            `User ${member.user.tag} verified in ${member.guild.name}`
        );

        return {
            status: 200,
            message: "Done!",
        };
    } catch (e: any) {
        console.error(e);
        return {
            status: 500,
            message: e.message,
        };
    }
};
