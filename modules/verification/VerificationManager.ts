import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    Guild,
    GuildMember,
    TextChannel,
} from "discord.js";
import { AxerBot } from "../../models/core/AxerBot";
import { guilds, users } from "../../database";
import createNewGuild from "../../database/utils/createNewGuild";
import createNewUser from "../../database/utils/createNewUser";
import { LoggerClient } from "../../models/core/LoggerClient";
import parseMessagePlaceholderFromMember from "../../helpers/text/parseMessagePlaceholderFromMember";
import colors from "../../constants/colors";
import { VerificationPermissionUtils } from "./struct/VerificationPermissionUtils";
import { VerificationErrorManager } from "./struct/VerificationErrorManager";
import { UserVerificationType } from "./models/UserVerification";
import { VerificationProcessor } from "./struct/VerificationProcessor";

export interface VerificationRequestObject {
    key: string | undefined;
    value: string | undefined;
}

export class VerificationManager {
    public axer: AxerBot;
    public Permissions = new VerificationPermissionUtils();
    public Errors: VerificationErrorManager;
    public Processor: VerificationProcessor;
    private logger = new LoggerClient("VerificationManager");

    constructor(axer: AxerBot) {
        this.axer = axer;
        this.Errors = new VerificationErrorManager(this.axer, this);
        this.Processor = new VerificationProcessor(this.axer);
    }

    public async handleMemberCreate(member: GuildMember) {
        if (member.user.bot) return; // Ignore bots

        const database = await this.getOrCreateDocuments(member, member.guild);

        if (database.error) return console.error(database);

        if (!database.data.guild.verification.enable) return;

        if (!database.guild.verification.isStatic)
            this.tryToSendWelcomeMessage(member, database.guild);
    }

    public async checkForVerificationRequestAndCreateNew(button: ButtonInteraction) {
        // Void return type here means this isn't a verification request

        const targets = button.customId.split(",");

        if (targets.length != 2 || !button.inGuild()) return; // This isn't a verification request

        const targetsValue = targets.map((target) => {
            return {
                key: target.split(":")[0],
                value: target.split(":")[1],
            } as VerificationRequestObject;
        });

        if (
            targetsValue.length != 2 ||
            targetsValue[0].key != "type" ||
            ![
                UserVerificationType.default.toString(),
                UserVerificationType.validate.toString(),
            ].includes(targetsValue[0].value as string)
        )
            return;

        const verificationType =
            targetsValue[0].value == UserVerificationType.default.toString()
                ? UserVerificationType.default
                : UserVerificationType.validate;

        const newVerification = await this.Processor.createVerificationFor(
            button.member as GuildMember,
            verificationType
        );

        if (newVerification.isError || !newVerification.data) return console.error(newVerification);

        newVerification.data
            .save()
            .then(() => console.log(newVerification))
            .catch(console.error);
    }

    /**
     * Main method that will be called after the user joins the guild
     * There's some validations to run before this
     */
    private async tryToSendWelcomeMessage(
        member: GuildMember,
        guildDocument: Awaited<ReturnType<typeof createNewGuild>>
    ) {
        try {
            const channel = await member.guild.channels.fetch(
                guildDocument?.verification.channel as string
            );

            if (!channel) return this.Errors.channelNotFound(member);

            if (
                !this.Permissions.hasMessagePermissionIn(
                    channel as TextChannel,
                    member.guild.members.me as GuildMember
                )
            )
                return this.Errors.missingMessagePermissions(member);

            if (channel && channel.isTextBased()) {
                this.logger.printInfo(
                    `Sending verification message for user ${member.user.tag} on ${member.guild.name} (${member.guild.id})...`
                );

                const components = this.generateVerificationWelcomeComponents(
                    member,
                    guildDocument
                );

                channel
                    .send({
                        embeds: [components.embed],
                        components: [components.button],
                    })
                    .catch((e) => {
                        this.logger.printError(`Can't send verification message`, e);
                    });
            }
        } catch (e) {
            this.logger.printError("Error during welcome message request:", e);
        }
    }

    private generateVerificationWelcomeComponents(
        member: GuildMember,
        guildDocument: Awaited<ReturnType<typeof createNewGuild>>
    ) {
        const embed = new EmbedBuilder()
            .setTitle("🔐 Verification Request")
            .setDescription(
                parseMessagePlaceholderFromMember(
                    guildDocument?.verification.message as string,
                    member,
                    guildDocument
                )
            )
            .setColor(colors.pink)
            .setTimestamp();

        const button = new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
                .setLabel("✅ Verify my account")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`type:verification,user:${member.user.id}`)
        );

        return {
            embed,
            button,
        };
    }

    /**
     * Create guild and user document and returns it
     */
    private async getOrCreateDocuments(member: GuildMember, guild: Guild) {
        let guildDocument = await guilds.findById(guild.id);

        if (!guildDocument) guildDocument = await createNewGuild(guild);

        if (!guildDocument)
            return this.createResponse<DocumentsResponse>(true, "Guild document not found!");

        let userDocument = await users.findById(member.id);

        if (!userDocument) userDocument = await createNewUser(guild);

        if (!userDocument) return this.createResponse(true, "User document not found!");

        interface DocumentsResponse {
            guild: typeof guildDocument;
            user: typeof userDocument;
        }

        return this.createResponse<DocumentsResponse>(false, "OK", {
            guild: guildDocument,
            user: userDocument,
        });
    }

    private createResponse<T = null>(error: true | false, message: string, data?: T) {
        return error == true
            ? {
                  error: true,
                  message,
                  data: null,
              }
            : {
                  error: false,
                  message,
                  data: data as T,
              };
    }
}
