import { Schema } from "mongoose";

export default new Schema({
	_id: {
		type: String,
	},
	created_at: {
		type: Date,
	},
	owner: {
		type: Number,
	},
	message: {
		type: String,
	},
	indexes: {
		type: Array,
		default: [
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
			19, 20, 21, 23, 24,
		],
	},
	answer: {
		type: String,
		default: "",
	},
	difficulty: {
		type: Number,
		default: 1,
	},
	channel: {
		type: String,
		default: 0,
	},
	guild: {
		type: String,
		default: 0,
	},
	played: {
		type: Number,
		default: 0,
	},
	beatmaps: {
		type: Array,
		default: [],
	},
	map: {
		type: Object,
		default: {},
	},
	date: {
		type: Date,
	},
	active: {
		type: Boolean,
		default: true,
	},
});
