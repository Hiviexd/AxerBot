import { userActivity } from "./qatUserActivity";
import { user } from "./qatUser";
import { allUsers } from "./qatAllUsers";

export default {
    fetch: {
        userActivity: userActivity,
        user: user,
        allUsers: allUsers,
    },
};
