import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { AxerBot } from "../../../models/core/AxerBot";
import { VerificationManager } from "../VerificationManager";
import colors from "../../../constants/colors";

export class VerificationErrorManager {
    public axer: AxerBot;
    public base: VerificationManager;

    constructor(axer: AxerBot, base: VerificationManager) {
        this.axer = axer;
        this.base = base;
    }

    public channelNotFound(member: GuildMember) {
        try {
            const embed = new EmbedBuilder()
                .setTitle("⚠️ Verification system alert")
                .setColor(colors.gold)
                .setDescription(
                    `The verification system in your server \`${member.guild.name}\` is not working properly. The configured channel doesn't exist. \`${member.user.tag}\` is waiting for verification. Please verify the user manually and fix the system.
                    Reach out to a developer in the [support server](https://discord.gg/MAsnz96qGy) if you need help.`
                );

            this.tryToSendError(embed, member);
        } catch (e) {
            console.error(e);
        }
    }

    public missingManagePermissions(member: GuildMember) {
        try {
            const embed = new EmbedBuilder()
                .setTitle("⚠️ Verification system alert")
                .setColor(colors.gold)
                .setDescription(
                    `The verification system in your server \`${member.guild.name}\` is not working properly. I don't have properly permissions to manage users like \`MANAGE_ROLES\` and \`MANAGE_NICKNAMES\`. Please verify the user \`${member.user.tag}\` manually and fix the system.
                    Reach out to a developer in the [support server](https://discord.gg/MAsnz96qGy) if you need help.`
                );

            this.tryToSendError(embed, member);
        } catch (e) {
            console.error(e);
        }
    }

    public missingMessagePermissions(member: GuildMember) {
        try {
            const embed = new EmbedBuilder()
                .setTitle("⚠️ Verification system alert")
                .setColor(colors.gold)
                .setDescription(
                    `The verification system in your server \`${member.guild.name}\` is not working properly. I don't have properly permissions to **send messages** (\`SEND_MESSAGES\`) into the verification channel. Please verify the user \`${member.user.tag}\` manually and fix the system.
                    Reach out to a developer in the [support server](https://discord.gg/MAsnz96qGy) if you need help.`
                );

            this.tryToSendError(embed, member);
        } catch (e) {
            console.error(e);
        }
    }

    private tryToSendError(embed: EmbedBuilder, member: GuildMember) {
        try {
            const guildModerationChannel = member.guild.publicUpdatesChannel;

            if (!guildModerationChannel) return this.sendErrorIntoOwnerDM(embed, member);

            if (
                !this.base.Permissions.hasMessagePermissionIn(
                    guildModerationChannel,
                    member.guild.members.me as GuildMember
                )
            )
                return this.sendErrorIntoOwnerDM(embed, member);

            this.sendErrorIntoModerationChannel(guildModerationChannel, embed);
        } catch (e) {
            console.error(e);
        }
    }

    private sendErrorIntoModerationChannel(channel: TextChannel, embed: EmbedBuilder) {
        return channel
            .send({
                embeds: [embed],
            })
            .catch(console.error);
    }

    private sendErrorIntoOwnerDM(embed: EmbedBuilder, member: GuildMember) {
        const guildOwner = member.guild.members.cache.get(member.guild.ownerId);

        if (!guildOwner) return console.error(member.guild.id, embed);

        guildOwner.createDM().then((dmChannel) => {
            dmChannel
                .send({
                    embeds: [embed],
                })
                .catch(console.error);
        });
    }
}
