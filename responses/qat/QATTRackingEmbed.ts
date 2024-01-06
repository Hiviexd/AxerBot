import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Channel,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { QatUser } from "../../types/qat";
import getEmoji from "../../helpers/text/getEmoji";
import colors from "../../constants/colors";
import getBNPreferences from "../../helpers/qat/getters/preferences/getBNPreferences";
import { LoggerClient } from "../../models/core/LoggerClient";

enum UserRequestStatus {
    gameChat = "gameChat",
    personalQueue = "personalQueue",
    closed = "closed",
}

export class QATTrackingEmbed extends EmbedBuilder {
    public user: QatUser;
    public isOpen: boolean;
    private logger = new LoggerClient("QatTrackingEmbed");

    constructor(isOpen: boolean, user: QatUser) {
        super();

        this.user = user;
        this.isOpen = isOpen;

        this.getModesIcons.bind(this);
        this.buildButtons.bind(this);
        this.buildTitle();
        this.buildDescription();
        this.buildExtras();

        if (this.isOpen) this.buildPreferences();
    }

    send(channel: Channel) {
        if (channel instanceof TextChannel) {
            channel
                .send({
                    embeds: [this.toJSON()],
                    components: this.isOpen ? [this.buildButtons()] : [],
                })
                .catch((e) =>
                    this.logger.printError(`Can't send message to channel ${channel.id}`, e)
                );
        }
    }

    private buildTitle() {
        this.setTitle(
            this.isOpen
                ? `🟢 Open (<t:${Math.trunc(new Date().valueOf() / 1000)}:R>)`
                : `🔴 Closed (<t:${Math.trunc(new Date().valueOf() / 1000)}:R>)`
        );
    }

    private buildDescription() {
        this.setDescription(
            this.isOpen
                ? `**[${this.user.username}](https://osu.ppy.sh/users/${
                      this.user.osuId
                  })** ${this.getModesIcons()} is now **accepting** BN requests!\n Check out their preferences below:`
                : `**[${this.user.username}](https://osu.ppy.sh/users/${
                      this.user.osuId
                  })** ${this.getModesIcons()} is **no longer** accepting BN requests.`
        );
    }

    private buildPreferences() {
        this.setFields(
            {
                name: "Positive",
                value: getBNPreferences.positive(this.user),
                inline: true,
            },
            {
                name: "Negative",
                value: getBNPreferences.negative(this.user),
                inline: true,
            }
        );
    }

    private buildExtras() {
        this.setThumbnail(`https://a.ppy.sh/${this.user.osuId}`)
            .setFooter({
                text: "BN website",
                iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
            })
            .setColor(this.isOpen ? colors.green : colors.red);
    }

    public buildButtons() {
        const requestMethods = this.getRequestMethods();

        const buttonsRow = new ActionRowBuilder<ButtonBuilder>();

        if (requestMethods.gameChat) {
            buttonsRow.addComponents(
                new ButtonBuilder()
                    .setLabel("Game Chat")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://osu.ppy.sh/home/messages/users/${this.user.osuId}`)
            );
        }

        if (requestMethods.personalQueue && this.user.requestLink) {
            buttonsRow.addComponents(
                new ButtonBuilder()
                    .setLabel(this.getPersonalQueueWebsite())
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://osu.ppy.sh/home/messages/users/${this.user.osuId}`)
            );
        }

        if (this.user.requestInfo) {
            buttonsRow.addComponents(
                new ButtonBuilder()
                    .setLabel("Request Info")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`bnrules,${this.user.osuId}`)
            );
        }

        return buttonsRow;
    }

    private getPersonalQueueWebsite() {
        try {
            const url = new URL(this.user.requestLink);

            return `Personal Queue (${url.hostname})`;
        } catch (e) {
            return "Personal Queue";
        }
    }

    private getRequestMethods() {
        return {
            gameChat: this.user.requestStatus.includes(UserRequestStatus.gameChat),
            personalQueue: this.user.requestStatus.includes(UserRequestStatus.personalQueue),
        };
    }

    private getModesIcons() {
        return this.user.modes
            .map((mode: string) => {
                return `${getEmoji(mode as keyof typeof getEmoji)} `;
            })
            .join("")
            .trim();
    }
}
