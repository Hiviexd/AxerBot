import { BeatmapsetEvent } from "../../../types/beatmap";
import { UserRecentEvent } from "../../../types/user";
import {
    handleMapperTracker,
    handleMapperTrackerUserEvent,
} from "../../tracking/mapperTracker";

export function handleDiscussionEvent(event: UserRecentEvent) {
    handleMapperTrackerUserEvent(event);
}
