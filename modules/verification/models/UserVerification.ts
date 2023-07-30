import { Guild, GuildMember, TextChannel } from "discord.js";
import { AxerBot } from "../../../models/core/AxerBot";
import { randomBytes } from "crypto";
import { verifications } from "../../../database";
import { LoggerClient } from "../../../models/core/LoggerClient";
import { User, UserStatisticsRulesets } from "../../../types/user";
import { GameMode, GameModeName } from "../../../types/game_mode";

export enum UserVerificationType {
    "validate" = "verification_validate",
    "default" = "verification",
}

// export interface IVerificationObject {
//     target_guild: string;
//     target_user: string;
//     createdAt: Date;
//     _id: string;
//     code: number;
//     type: VerificationType;
//     target_channel?: string;
// }

export interface IRankRole {
    id: string;
    type: "country" | "global";
    gamemode: GameModeName;
    min_rank: number;
    max_rank: number;
}

export interface IGroupRole {
    id: string;
    modes: "all" | "none" | "osu" | "taiko" | "fruits" | "mania" | string;
    group: "DEV" | "SPT" | "NAT" | "BN" | "PBN" | "GMT" | "LVD" | "ALM" | "BSC" | string;
    probation: boolean;
}

export class UserVerification {
    public axer: AxerBot;
    public member: GuildMember;
    public guild: Guild;
    public channel: TextChannel | null = null;
    public createdAt: Date = new Date();
    public id: string = randomBytes(15).toString("hex");
    public type: UserVerificationType = UserVerificationType.default;
    public code: number = this.generateCode();
    private isClone = false;
    private logger = new LoggerClient("UserVerification");

    constructor(
        axer: AxerBot,
        member: GuildMember,
        type: UserVerificationType,
        channel?: TextChannel
    ) {
        this.axer = axer;
        this.member = member;
        this.guild = member.guild;
        this.type = type;

        if (channel) this.channel = channel;
    }

    public cloneFromDatabase(
        verificationFromDatabase: Awaited<ReturnType<typeof this.fetchFromDatabase>>
    ) {
        // These fields aren't null
        this.code = Number(verificationFromDatabase?.code as string);
        this.id = verificationFromDatabase?._id as string;
        this.createdAt = new Date(verificationFromDatabase?.createdAt as Date);

        const verificationGuild = this.axer.guilds.cache.get(
            verificationFromDatabase?.target_guild as string
        );

        if (!verificationGuild) return this.createError("Target guild doesn't exists");

        this.guild = verificationGuild;

        const verificationMember = verificationGuild.members.cache.get(
            verificationFromDatabase?.target_guild as string
        );

        if (!verificationMember) return this.createError("Target member doesn't exists");

        this.member = verificationMember;

        if (verificationFromDatabase?.target_channel) {
            const channel = this.guild.channels.cache.get(
                verificationFromDatabase.target_channel as string
            );

            if (!channel) return this.createError("Target channel doesn't exists");

            this.channel = channel as TextChannel;
        }

        const verificationType =
            (verificationFromDatabase?.type as string) == UserVerificationType.default.toString()
                ? UserVerificationType.default
                : UserVerificationType.validate;

        this.type = verificationType;

        this.isClone = true;

        return this.generateSuccess("OK");
    }

    public async applyUsername(user: User) {
        if (!this.member) return this.createError("User not found!");

        if (
            !this.axer.Verification.Permissions.hasManageUsersPermission(
                this.member.guild.members.me as GuildMember
            )
        ) {
            this.axer.Verification.Errors.missingManagePermissions(this.member);

            return this.createError("Invalid manage permission");
        }

        await this.member.setNickname(user.username, "AxerBot Verification System");

        return this.generateSuccess("Username applied");
    }

    public async applyRankRoles(user: User, roles: IRankRole[]) {
        if (!this.member) return this.createError("User not found!");

        if (
            !this.axer.Verification.Permissions.hasManageUsersPermission(
                this.member.guild.members.me as GuildMember
            )
        ) {
            this.axer.Verification.Errors.missingManagePermissions(this.member);

            return this.createError("Invalid manage permission");
        }

        for (const role of roles) {
            const roleObject = await this.member.guild.roles.fetch(role.id);

            const rankMode = role.type == "global" ? "global_rank" : "country_rank";

            if (
                user.statistics_rulesets[role.gamemode as string][rankMode] > role.min_rank &&
                user.statistics_rulesets[role.gamemode as string][rankMode] < role.max_rank
            )
                if (
                    roleObject &&
                    roleObject.position <
                        (this.member.guild.members.me as GuildMember).roles.highest.position
                ) {
                    this.logger.printInfo(
                        `Added role ${roleObject.name} to ${this.member.user.tag} on ${this.member.guild}`
                    );

                    this.member.roles.add(roleObject);

                    this.logger.printSuccess(
                        `Added role ${roleObject.name} (${role.id}) to ${this.member.user.tag} on ${this.member.guild}! Ignoring it...`
                    );
                } else {
                    if (roleObject && this.member.roles.cache.has(roleObject.id)) {
                        this.logger.printWarning(
                            `Invalid role for ${this.member.user.tag} -> ${role.id} on ${this.member.guild}! Removing it...`
                        );

                        this.member.roles.remove(roleObject); // Remove old rank roles
                    } else {
                        this.logger.printWarning(
                            `Role ${role.id} not found on ${this.member.guild}! Ignoring it...`
                        );
                    }
                }
        }
    }

    public async applyGroupRoles(user: User, roles: IGroupRole[]) {
        if (!this.member) return this.createError("User not found!");

        if (
            !this.axer.Verification.Permissions.hasManageUsersPermission(
                this.member.guild.members.me as GuildMember
            )
        ) {
            this.axer.Verification.Errors.missingManagePermissions(this.member);

            return this.createError("Invalid manage permission");
        }

        if (!user.groups || user.groups.length == 0)
            return this.generateSuccess("User doesn't has any usergroup");

        const probationaryUserGroups = ["PBN"]; // we need to rewrite this shit

        for (const role of roles) {
            if (probationaryUserGroups.includes(role.group)) {
                role.group = role.group.slice(1);
                role.probation = true;
            } else {
                role.probation = false;
            }

            const targetUsergroupForRole = user.groups.find((group) => {
                if (
                    group.has_playmodes &&
                    role.modes != "all" &&
                    !group.playmodes.find((mode) => role.modes.includes(mode))
                )
                    return false;

                if (group.short_name != role.group) return false;

                if (!group.is_probationary && role.probation) return false;

                if (group.has_playmodes && role.modes.includes("none")) return false;

                return true;
            });

            if (!targetUsergroupForRole) {
                this.logger.printWarning(
                    "User groups doesn't match server configuration! Ignoring it and removing role if it exists..."
                );

                if (this.member.roles.cache.has(role.id)) {
                    this.logger.printInfo("User has role! Removing it...");

                    this.member.roles.remove(role.id).catch(console.log);
                }

                return this.generateSuccess("User groups doesn't match configuration.");
            }

            const roleObject = await this.member.guild.roles.fetch(role.id);

            if (!roleObject) {
                this.logger.printWarning("Role doesn't exist! Ignoring this step...");

                return this.generateSuccess("Role doesn't exist");
            }
        }
    }

    private fetchFromDatabase() {
        return verifications.findById(this.id);
    }

    private generateCode() {
        const minm = 100000;
        const maxm = 999999;

        return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
    }

    public save() {
        if (this.isClone) {
            return verifications.updateOne({ _id: this.id }, { $set: this.toMongoObject(false) });
        } else {
            return verifications.create(this.toMongoObject(true));
        }
    }

    public toMongoObject(withId: boolean) {
        const object = {
            target_guild: this.guild.id,
            target_channel: this.channel ? this.channel.id : null,
            target_user: this.member.user.id,
            code: this.code,
            createdAt: this.createdAt,
            type: this.type.toString(),
        };

        if (withId) return Object.assign(object, { _id: this.id });

        return object;
    }

    private createError(message: string) {
        this.logger.printError(`Can't verify user: ${message}`);

        return {
            isError: true,
            message,
            data: null,
        };
    }

    private generateSuccess(message: string) {
        return {
            isError: false,
            message,
            data: this,
        };
    }
}
