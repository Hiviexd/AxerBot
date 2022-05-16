import { Schema } from "mongoose";
import config from "../../config.json";

export default new Schema({
	_id: {
		type: String,
	},
	prefix: {
		type: String,
		default: config.prefix,
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
	embeds: {
		type: Object,
		default: {
			beatmap: {
				all: true,
				channels: [],
			},
			player: {
				all: true,
				channels: [],
			},
			discussion: {
				all: true,
				channels: [],
			},
			comment: {
				all: true,
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
	autorole: {
		users: [],
		bot: [],
	},
	logging: {
		type: Object,
		default: {
			enable: false,
			channel: "",
		},
	},
});
