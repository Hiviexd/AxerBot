import { EventEmitter } from "events";

import { tracks, userEvents } from "../../database";
import { consoleCheck, consoleLog } from "../../helpers/core/logger";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { BeatmapsetEvent } from "../../types/beatmap";
import { UserRecentEvent, UserRecentEventType } from "../../types/user";
import { arrayOnce } from "../../helpers/functions/arrayOnce";
import { parseOsuPathId } from "../../helpers/text/parseOsuPathId";

abstract class UserEventEmitter extends EventEmitter {
    constructor() {
        super();
    }

    on(
        eventEvent: keyof UserRecentEventType | string | symbol,
        callback: (data: UserRecentEvent) => void
    ) {
        return this;
    }
}

export class UserEventsListener {
    private allowList = [
        UserRecentEventType.BeatmapsetApprove,
        UserRecentEventType.BeatmapsetRevive,
        UserRecentEventType.BeatmapsetUpdate,
        UserRecentEventType.BeatmapsetUpload,
    ];
    public events = new EventEmitter() as UserEventEmitter;

    constructor() {
        this.events.emit.bind(this);
    }

    async tryToInsertNewEvent(event: UserRecentEvent) {
        this.events.emit.bind(this);

        try {
            if (!this.allowList.map((t) => t.toString()).includes(event.type))
                return {
                    status: 400,
                    data: {
                        message: `Don't index ${event.type}`,
                    },
                };

            const exists = await userEvents.findById(event.id);

            if (exists)
                return {
                    status: 201,
                    data: {
                        message: `Exists ${event.id}`,
                    },
                };

            const response = await userEvents.create({
                _id: event.id,
                beatmapId: event.beatmap?.url ? parseOsuPathId(event.beatmap.url) : null,
                beatmapsetId: event.beatmapset?.url ? parseOsuPathId(event.beatmapset.url) : null,
                createdAt: new Date(event.created_at),
                type: event.type,
                userId: parseOsuPathId(event.user.url),
            });

            consoleCheck(`UserEventsManager`, `Inserted event ${event.id} with type ${event.type}`);

            this.events.emit("any", event);
            this.events.emit(event.type, event);

            return {
                status: 200,
                data: response,
            };
        } catch (e: any) {
            if (e.status == 404 || (e.response && e.response.status) == 404) return;

            console.log(e);

            return {
                status: 500,
                data: e,
            };
        }
    }

    async listen(): Promise<unknown> {
        consoleLog(`UserEventsManager`, `Starting listener`);

        const allMapperTrackers = await tracks.find({
            type: "mapper",
        });

        const sanitizedTrackers: (typeof allMapperTrackers)[0][] = [];

        for (const tracker of allMapperTrackers) {
            if (!sanitizedTrackers.find((t) => t.userId == tracker.userId && tracker.userId))
                sanitizedTrackers.push(tracker);
        }

        for (const tracker of sanitizedTrackers) {
            const events = await osuApi.fetch.userRecentActivity(tracker.userId || "");

            if (events.status == 404) {
                await tracker.delete({ _id: tracker._id });

                consoleLog(
                    "UserEventsManager",
                    `Removed ${tracker.userId} from tracker because this user doesn't exists`
                );
            }

            if (events.status != 200) {
                return setTimeout(this.listen.bind(this), 300000);
            }

            for (const event of events.data) {
                await this.tryToInsertNewEvent(event);
            }
        }

        setTimeout(this.listen.bind(this), 300000);
    }
}
