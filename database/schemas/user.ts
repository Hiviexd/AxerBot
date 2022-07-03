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
		},
	},
});
