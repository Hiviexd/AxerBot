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
	cooldown: {
		type: Object,
		default: {
			contests: {
				size: 0,
				ends_at: {},
				current_increments: 0,
				increments: 0,
				channels: [],
			},
			fun: {
				size: 0,
				ends_at: {},
				current_increments: 0,
				increments: 0,
				channels: [],
			},
			misc: {
				size: 0,
				ends_at: {},
				current_increments: 0,
				increments: 0,
				channels: [],
			},
			management: {
				size: 0,
				ends_at: {},
				current_increments: 0,
				increments: 0,
				channels: [],
			},
			osu: {
				size: 0,
				ends_at: {},
				current_increments: 0,
				increments: 0,
				channels: [],
			},
			BNsite: {
				size: 0,
				ends_at: {},
				current_increments: 0,
				increments: 0,
				channels: [],
			},
		},
	},
	messages: {
		type: Object,
		default: {
			join: {
				content: "",
				embeds: [
					{
						author: {
							name: "Welcome {username}! 👋",
							icon: "{user_avatar}",
							colour: "#37afc6",
						},
						description: "Welcome to the server {username}",
					},
				],
			},
			leave: {
				content: "",
				embeds: [
					{
						author: {
							name: "Oh no, bye {username}!",
							icon: "{user_avatar}",
							colour: "#37afc6",
						},
						description: "Oh, {username} has left the server...",
					},
				],
			},
		},
	},
	qat_tracking: [{ type: String, channel: String }],
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
});
