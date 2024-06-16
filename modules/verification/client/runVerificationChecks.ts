import { Guild, GuildMember } from "discord.js";
import { guilds, users } from "../../../database";
import { User, UserGroup } from "../../../types/user";
import osuApi from "../../../modules/osu/fetcher/osuApi";
import {
    IMapperRole,
    MapperRoleType,
} from "../../../commands/management/subcommands/verification/addMapperRole";
import { Beatmapset } from "../../../types/beatmap";
import { countryFlags } from "../../../constants/countryflags";
import { BeatmapStatus } from "../../../struct/beatmaps/SearchTypes";

export async function runVerificationChecks(guild: Guild, user: User, member: GuildMember) {
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

    if (guild_db.verification.targets.country_role) {
        if (!guild_db.country_roles) guild_db.country_roles = [];

        let roleDataForCountry = guild_db.country_roles.find((r) => r.country == user.country_code);

        function canCreateIcon() {
            return (
                guild.features.includes("ROLE_ICONS") &&
                guild_db?.verification.targets.country_role_icons
            );
        }

        // ? Create role if doesn't exists
        if (!roleDataForCountry) {
            const newRole = await guild.roles.create({
                name: user.country.name || "Unknown Country",
                reason: "AxerBot Verification System",
                unicodeEmoji: canCreateIcon()
                    ? countryFlags[user.country.code.toUpperCase()]
                    : undefined,
            });

            const newData = {
                country: user.country_code,
                id: newRole.id,
            };

            guild_db.country_roles.push(newData);

            roleDataForCountry = newData;

            await guild_db.save();
        }

        let roleToAdd = await guild.roles.fetch(String(roleDataForCountry.id));

        if (!roleToAdd) {
            const newRole = await guild.roles.create({
                name: user.country.name || "Unknown Country",
                reason: "AxerBot Verification System",
                unicodeEmoji: canCreateIcon()
                    ? countryFlags[user.country.code.toUpperCase()]
                    : undefined,
            });

            const roleIndex = guild_db.country_roles.findIndex(
                (r) => r.country == user.country_code
            );

            guild_db.country_roles[roleIndex].id = newRole.id;

            roleToAdd = newRole;

            await guild_db.save();
        }

        if (!roleToAdd.icon && canCreateIcon()) {
            await roleToAdd.setUnicodeEmoji(countryFlags[user.country.code.toUpperCase()]);
        }

        member.roles.add(roleToAdd, "AxerBot Verification System");
    }

    addRankRoles();

    for (const _role of guild_db.verification.targets.default_roles) {
        try {
            const role = await guild.roles.fetch(_role);

            if (role) {
                await member.roles.add(role);
            }
        } catch (e: any) {
            console.error("adding default role", e.roles);
        }
    }

    const probationaryRoles = ["PBN"];
    if (user.groups) {
        for (const group of user.groups) {
            addRole(group.short_name, group, group.is_probationary);
        }
    }

    async function addRole(role: string, usergroup: UserGroup, probationary: boolean) {
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
                    console.error(`adding guild group role ${role} ${guildRole.id}`, e);
                }
            } else {
                console.log(`Role for ${role} not found`);
            }
        } catch (e: any) {
            console.error(`adding group role ${role}`, e);
        }

        function hasRequiredPlaymodes() {
            let r = false;

            if (configuration.modes.includes("none") && (usergroup.playmodes || []).length == 0)
                return true;

            if (configuration.modes.length == 0) return true;

            (usergroup.playmodes || []).forEach((m) => {
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

        if (!roles || roles.length == 0) return console.log("Server without configuration");

        roles.forEach((r: any) => execute(r));

        async function execute(r: any) {
            const role = guild.roles.cache.get(r.id);

            if (!role) return console.log("Role not found!");

            if (!user.statistics) return console.log("User without rank");

            const osu = await osuApi.fetch.user(user.id.toString(), r.gamemode);

            if (osu.status != 200 || !osu.data) return console.log("Osu user not found!");

            const osuData: User = osu.data;

            if (!osuData.statistics) return console.log("User without statistics!");

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

        for (const role of roles) {
            checkFor(role);
        }

        async function fetchBeatmapsWithMode(modes: string[], status?: string) {
            let maps: Beatmapset[] = [];

            for (const mode of modes) {
                const b = await osuApi.fetch.searchBeatmapset(`creator=${user.id}`, mode, status);

                if (b.status == 200 && b.data) {
                    maps = maps.concat(b.data.beatmapsets.filter((b) => b.user_id == user.id));
                }
            }

            return maps;
        }

        async function fetchPendingAndGraveyard(modes: string[]) {
            let maps: Beatmapset[] = [];

            const pending = await osuApi.fetch.basicUserBeatmaps(user.id, "pending");

            if (!pending.data || pending.status != 200) return [] as Beatmapset[];

            const graveyard = await fetchBeatmapsWithMode(modes, "graveyard");

            maps = maps.concat(pending.data).concat(graveyard);

            return maps;
        }

        async function checkFor(role: IMapperRole) {
            if (!guild_db) return;

            const matchStatus = await isBeatmapAllowed(role.modes, role.target);

            if (matchStatus.hasRequired) {
                for (const roleId of role.roles) {
                    if (role.target == MapperRoleType.RankedMapper && matchStatus.isRanked)
                        await member.roles.add(roleId);

                    if (role.target == MapperRoleType.LovedMapper && matchStatus.isLoved)
                        await member.roles.add(roleId);

                    if (
                        role.target == MapperRoleType.AspirantMapper &&
                        !matchStatus.isLoved &&
                        !matchStatus.isRanked
                    )
                        await member.roles.add(roleId);
                }
            }

            async function isBeatmapAllowed(modes: string[], type: MapperRoleType) {
                const modeToInt = ["osu", "taiko", "fruits", "mania"];
                const typesToStatus = {
                    r: await fetchBeatmapsWithMode(
                        modes.map((m) => modeToInt.indexOf(m).toString()),
                        BeatmapStatus.Ranked
                    ),
                    l: await fetchBeatmapsWithMode(
                        modes.map((m) => modeToInt.indexOf(m).toString()),
                        BeatmapStatus.Loved
                    ),
                    a: await fetchPendingAndGraveyard(
                        modes.map((m) => modeToInt.indexOf(m).toString())
                    ),
                };

                const rankedStatus = {
                    osu: typesToStatus.r.length > 0,
                    taiko: typesToStatus.r.length > 0,
                    fruits: typesToStatus.r.length > 0,
                    mania: typesToStatus.r.length > 0,
                };

                const lovedStatus = {
                    osu: typesToStatus.l.length > 0,
                    taiko: typesToStatus.l.length > 0,
                    fruits: typesToStatus.l.length > 0,
                    mania: typesToStatus.l.length > 0,
                };

                if (typesToStatus[type].length < role.min)
                    return {
                        isRanked:
                            rankedStatus.osu == true ||
                            rankedStatus.taiko == true ||
                            rankedStatus.fruits == true ||
                            rankedStatus.mania == true,
                        isLoved:
                            lovedStatus.osu == true ||
                            lovedStatus.taiko == true ||
                            lovedStatus.fruits == true ||
                            lovedStatus.mania == true,
                        hasRequired: false,
                    };

                if (typesToStatus[type].length > role.max)
                    return {
                        isRanked:
                            rankedStatus.osu == true ||
                            rankedStatus.taiko == true ||
                            rankedStatus.fruits == true ||
                            rankedStatus.mania == true,
                        isLoved:
                            lovedStatus.osu == true ||
                            lovedStatus.taiko == true ||
                            lovedStatus.fruits == true ||
                            lovedStatus.mania == true,
                        hasRequired: false,
                    };

                return {
                    isRanked:
                        rankedStatus.osu == true ||
                        rankedStatus.taiko == true ||
                        rankedStatus.fruits == true ||
                        rankedStatus.mania == true,
                    isLoved:
                        lovedStatus.osu == true ||
                        lovedStatus.taiko == true ||
                        lovedStatus.fruits == true ||
                        lovedStatus.mania == true,
                    hasRequired: true,
                };
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
