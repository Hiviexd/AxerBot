import { Schema } from "mongoose";

export default new Schema({
	_id: {
		type: String,
	},
	pending_verifications: {
		type: Array,
		default: [],
	},
	osu: {
		type: Object,
		default: {
			username: undefined,
			mode: undefined,
		},
	},
	reminders: {
		type: Array,
		default: [],
	},
	heardle: {
		type: Object,
		default: {
			active: false,
			guild: 0,
			channel: 0,
			difficulty: 1,
			id: "",
			answer: "",
			indexes: [
				0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
				18, 19, 20, 21, 23, 24,
			],
		},
	},
});
