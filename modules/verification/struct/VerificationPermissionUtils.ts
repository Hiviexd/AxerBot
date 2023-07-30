import { TextChannel, GuildMember } from "discord.js";

export class VerificationPermissionUtils {
    constructor() {}

    public hasMessagePermissionIn(channel: TextChannel, botMember: GuildMember) {
        return (
            botMember.permissionsIn(channel).has("SendMessages", true) ||
            botMember.roles.cache.find((role) =>
                role.permissionsIn(channel).has("SendMessages", true)
            ) != undefined
        );
    }

    public hasManageUsersPermission(botMember: GuildMember) {
        return (
            botMember.permissions.has(["ManageNicknames", "ManageRoles"], true) ||
            (botMember.roles.cache.find((role) => role.permissions.has("ManageNicknames", true)) !=
                undefined &&
                botMember.roles.cache.find((role) => role.permissions.has("ManageRoles", true)) !=
                    undefined)
        ); // We should filter one by one because it can mix role permissions
    }
}
