import { userActivity } from "./qatUserActivity";
import { user } from "./qatUser";
import { allUsers } from "./qatAllUsers";
import { events } from "./qatBeatmapEvents";

export default {
	fetch: {
		userActivity: userActivity,
		user: user,
		allUsers: allUsers,
		events: events,
	},
};
