import { tracks } from "../../database";
import { QatUser } from "../../types/qat";
import WebSocket, { RawData } from "ws";
import { AxerBot } from "../../models/core/AxerBot";
import { LoggerClient } from "../../models/core/LoggerClient";
import { Document } from "mongoose";
import { QATTrackingEmbed } from "../../responses/qat/QATTRackingEmbed";

export interface QATNullableUserRequestStatusMessage {
    type: string;
    data: {
        isOpen: boolean;
        user: QatUser;
    } | null;
}

export interface QATUserRequestStatusMessage {
    type: string;
    data: {
        isOpen: boolean;
        user: QatUser;
    };
}

export enum QATMessageType {
    RequestStatusUpdate = "users:request_status_update",
}

export interface QATTrackerObject extends Document {
    _id: string;
    type: string;
    targets: {
        modes: string[];
        open: boolean;
        closed: boolean;
    };
    targetsArray: string[];
    userId: string;
    channel: string;
    guild: string;
}

export class QATTracker {
    public axer: AxerBot;
    private socket!: WebSocket;
    private logger = new LoggerClient("QATTRacker");

    constructor(axer: AxerBot) {
        this.axer = axer;
    }

    listen() {
        this.socket = new WebSocket("wss://bn.mappersguild.com/websocket/interOp", {
            headers: {
                username: process.env.QAT_USER,
                secret: process.env.QAT_SECRET,
                tags: QATMessageType.RequestStatusUpdate,
            },
        });

        this.socket.on("open", () => this.logger.printSuccess("Connected to BNSite!"));

        this.socket.on("close", (error) => {
            this.logger.printError(`Socket closed: `, error);

            this.socket = new WebSocket("wss://bn.mappersguild.com/websocket/interOp", {
                headers: {
                    username: process.env.QAT_USER,
                    secret: process.env.QAT_SECRET,
                    tags: QATMessageType.RequestStatusUpdate,
                },
            });
        });

        this.handleMessage.bind(this);
        this.socket.on("message", (message) => {
            this.logger.printInfo(`Received message`);

            this.handleMessage(message);
        });
    }

    async handleUserUpdate(message: QATUserRequestStatusMessage) {
        try {
            const query = {
                type: "qat",
                "targets.modes": { $in: message.data.user.modes },
            } as {
                type: string;
                "targets.modes": { $in: string[] };
                "targets.open"?: boolean;
                "targets.closed"?: boolean;
            };

            if (message.data.isOpen) {
                query["targets.open"] = message.data.isOpen;
            } else {
                query["targets.closed"] = !message.data.isOpen;
            }

            const trackers = await tracks.find(query);

            for (const tracker of trackers) {
                this.handleUserUpdateForTracker(tracker, message.data.isOpen, message.data.user);
            }
        } catch (e) {
            this.logger.printError("Can't handle user update message!", e);
        }
    }

    handleUserUpdateForTracker(tracker: QATTrackerObject, isOpen: boolean, user: QatUser) {
        try {
            this.axer.channels
                .fetch(tracker.channel)
                .then((channel) => {
                    if (!channel)
                        return this.logger.printError(
                            `Can't find channel for tracker ${tracker._id}`
                        );

                    new QATTrackingEmbed(isOpen, user).send(channel);
                })
                .catch((error) =>
                    this.logger.printError(`Can't find channel for tracker ${tracker._id}`, error)
                );
        } catch (e) {
            this.logger.printError("Can't handle tracker", e);
        }
    }

    handleMessage(data: RawData) {
        try {
            const message = JSON.parse(data.toString()) as QATNullableUserRequestStatusMessage;

            if (!message.type) return this.logger.printWarning("Message missing type");
            if (!message.data) return this.logger.printWarning("Message missing data");

            if (message.type === QATMessageType.RequestStatusUpdate) {
                this.handleUserUpdate(message as QATUserRequestStatusMessage);
            }
        } catch (e) {
            this.logger.printError("Can't handle message", e);
        }
    }
}
