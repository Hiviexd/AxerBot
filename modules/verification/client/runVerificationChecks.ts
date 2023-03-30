import { Guild, GuildMember } from "discord.js";
import { guilds, users, verifications } from "../../../database";
import { User, UserGroup } from "../../../types/user";
import osuApi from "../../../helpers/osu/fetcher/osuApi";
import {
    IMapperRole,
    MapperRoleType,
} from "../../../commands/management/subcommands/verification/addMapperRole";
import { HTTPResponse } from "../../../types/qat";
import { Beatmapset } from "../../../types/beatmap";
import { IHTTPResponse } from "../../../types/http";
import { bot } from "../../..";

export async function runVerificationChecks(
    guild: Guild,
    user: User,
    member: GuildMember
) {
    const guild_db = await guilds.findById(guild.id);

    if (!guild_db) return;

    if (guild_db.verification.targets.username) {
        await member
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
        const configuration = guild_db.verification.targets.group_roles.find(
            (r: any) => r.group == (probationary ? `P${role}` : role)
        );

        if (!configuration) {
            console.log(`stop on configuration ${role}`);
            return;
        }

        if (configuration.modes.includes("none") && usergroup.has_playmodes) {
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

            const osu = await osuApi.fetch.user(user.id.toString(), r.gamemode);

            if (osu.status != 200 || !osu.data)
                return console.log("Osu user not found!");

            const osuData: User = osu.data;

            if (!osuData.statistics)
                return console.log("User without statistics!");

            if (
                (r.type == "country" && !osuData.statistics.country_rank) ||
                (r.type == "country" && osuData.statistics.country_rank == 0)
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

    if (guild_db.verification.mapper_roles) {
        const roles = guild_db.verification.mapper_roles as IMapperRole[];

        const beatmaps: {
            [key: string]: Beatmapset[];
        } = {
            r: await fetchBeatmapsWithMode(
                ["osu", "taiko", "fruits", "mania"],
                "ranked"
            ),
            l: await fetchBeatmapsWithMode(
                ["osu", "taiko", "fruits", "mania"],
                "loved"
            ),
            a: await fetchPendingAndGraveyard([
                "osu",
                "taiko",
                "fruits",
                "mania",
            ]),
        };

        const allBeatmaps = ([] as Beatmapset[])
            .concat(beatmaps.r)
            .concat(beatmaps.l)
            .concat(beatmaps.a);

        for (const role of roles) {
            checkFor(role);
        }

        async function fetchBeatmapsWithMode(modes: string[], status?: string) {
            let maps: Beatmapset[] = [];

            for (const mode of modes) {
                const b = await osuApi.fetch.searchBeatmapset(
                    `creator=${user.id}`,
                    mode,
                    status
                );

                if (b.status == 200 && b.data) {
                    maps = maps.concat(b.data.beatmapsets);
                }
            }

            return maps;
        }

        async function fetchPendingAndGraveyard(modes: string[]) {
            let maps: Beatmapset[] = [];

            const pending = await osuApi.fetch.basicUserBeatmaps(
                user.id,
                "pending"
            );

            if (!pending.data || pending.status != 200)
                return [] as Beatmapset[];

            const graveyard = await fetchBeatmapsWithMode(modes, "graveyard");

            maps = maps.concat(pending.data).concat(graveyard);

            return maps;
        }

        async function checkFor(role: IMapperRole) {
            if (!guild_db) return;

            const beatmapCount = {
                r: user.ranked_and_approved_beatmapset_count,
                l: user.loved_beatmapset_count,
                a:
                    user.graveyard_beatmapset_count +
                    user.pending_beatmapset_count,
            };

            if (beatmapCount[role.target] < role.min) return;
            if (beatmapCount[role.target] > role.max) return;

            if (isBeatmapAllowed()) {
                for (const roleId of role.roles) {
                    await member.roles.add(roleId);
                }
            }

            function isBeatmapAllowed() {
                let r = false;
                let isRanked = false;

                for (const mode of role.modes) {
                    if (
                        allBeatmaps.filter((s) =>
                            s.beatmaps?.filter((b) => b.mode == mode)
                        ).length != 0
                    )
                        r = true;

                    if (role.target == MapperRoleType.AspirantMapper) {
                        if (
                            allBeatmaps.filter((s) =>
                                s.beatmaps?.filter((b) =>
                                    ["wip", "graveyard", "pending"].includes(
                                        b.status
                                    )
                                )
                            ).length != 0
                        )
                            isRanked = true;
                    } else {
                        if (
                            allBeatmaps.filter((s) =>
                                s.beatmaps?.filter((b) =>
                                    [
                                        "ranked",
                                        "approved",
                                        "qualified",
                                    ].includes(b.status)
                                )
                            ).length != 0
                        )
                            isRanked = true;
                    }
                }

                if (
                    r == true &&
                    role.target == MapperRoleType.AspirantMapper &&
                    isRanked
                )
                    return false;

                return r;
            }
        }
    }

    await users.findByIdAndUpdate(member.user.id, {
        $set: {
            osu: {
                username: user.id.toString(),
            },
            verified_id: user.id,
        },
    });
}
