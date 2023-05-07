import { Schema } from "mongoose";

export default new Schema({
    _id: {
        type: String,
    },
    prefix: {
        type: String,
        default: "-",
    },
    osu: {
        type: Object,
        default: {
            embeds: {
                beatmap: true,
                user: true,
                discussion: true,
            },
        },
    },
    verification: {
        type: Object,
        default: {
            enable: false,
            channel: "",
            message:
                "Hello {member} and welcome to the server! To get access to the channels, click on the button below!",
            emoji: "✅",
            targets: {
                username: true,
                default_roles: [],
                group_roles: [],
                mapper_roles: [],
                rank_roles: [
                    {
                        id: String,
                        type: { type: String, enum: ["country", "global"] },
                        gamemode: {
                            type: String,
                            enum: ["osu", "taiko", "fruits", "mania"],
                        },
                        min_rank: Number,
                        max_rank: Number,
                    },
                ],
            },
            button: true,
        },
    },
    embeds: {
        type: Object,
        default: {
            beatmap: {
                all: true,
                none: false,
                channels: [],
            },
            player: {
                all: true,
                none: false,
                channels: [],
            },
            discussion: {
                all: true,
                none: false,
                channels: [],
            },
            comment: {
                all: true,
                none: false,
                channels: [],
            },
            modhub: {
                all: true,
                none: false,
                channels: [],
            },
            scores: {
                all: true,
                none: false,
                channels: [],
            },
        },
    },
    channels: {
        type: Object,
        default: {
            join: undefined,
            leave: undefined,
            logs: undefined,
        },
    },
    fun: {
        type: Object,
        default: {
            enable: true,
            mode: "default",
            word: "axer",
            revolver: 0,
            chance: 100,
            blacklist: {
                channels: [],
                words: [],
            },
        },
    },
    role_presets: [{ name: String, roles_add: Array, roles_remove: Array }],
    country_roles: [{ country: String, id: String }],
    flaglb: [{ userId: String, score: Number }],
    logging: {
        type: Object,
        default: {
            enable: false,
            channel: "",
        },
    },
    osuTimestamps: {
        type: Boolean,
        default: true,
    },
    user_logs: [
        {
            username: String,
            logs: [{ reason: String, date: Date }],
        },
    ],
    reports: {
        type: Object,
        default: {
            enable: false,
            channel: "",
            ping: false,
            role: "",
        },
    }
});
