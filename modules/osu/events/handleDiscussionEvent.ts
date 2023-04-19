import { BeatmapsetEvent } from "../../../types/beatmap";
import { handleMapperTracker } from "../../tracking/mapperTracker";

export function handleDiscussionEvent(event: BeatmapsetEvent) {
    handleMapperTracker(event);
}
