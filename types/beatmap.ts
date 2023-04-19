import type { Failtimes } from "./failtimes";
import { GameModeName } from "./game_mode";
import { RankedStatus } from "./ranked_status";
import type { Timestamp } from "./timestamp";
import type { User, UserCompact } from "./user";

export enum BeatmapsetEventType {
    NOMINATE = "nominate",
    LOVE = "love",
    REMOVE_FROM_LOVED = "remove_from_loved",
    QUALIFY = "qualify",
    DISQUALIFY = "disqualify",
    APPROVE = "approve",
    RANK = "rank",

    KUDOSU_ALLOW = "kudosu_allow",
    KUDOSU_DENY = "kudosu_deny",
    KUDOSU_GAIN = "kudosu_gain",
    KUDOSU_LOST = "kudosu_lost",
    KUDOSU_RECALCULATE = "kudosu_recalculate",

    ISSUE_RESOLVE = "issue_resolve",
    ISSUE_REOPEN = "issue_reopen",

    DISCUSSION_LOCK = "discussion_lock",
    DISCUSSION_UNLOCK = "discussion_unlock",

    DISCUSSION_DELETE = "discussion_delete",
    DISCUSSION_RESTORE = "discussion_restore",

    DISCUSSION_POST_DELETE = "discussion_post_delete",
    DISCUSSION_POST_RESTORE = "discussion_post_restore",

    NOMINATION_RESET = "nomination_reset",
    NOMINATION_RESET_RECEIVED = "nomination_reset_received",

    GENRE_EDIT = "genre_edit",
    LANGUAGE_EDIT = "language_edit",
    NSFW_TOGGLE = "nsfw_toggle",
    OFFSET_EDIT = "offset_edit",
    TAGS_EDIT = "tags_edit",
    BEATMAP_OWNER_CHANGE = "beatmap_owner_change",
}

export interface BeatmapsetEvent {
    id: number;
    type: BeatmapsetEventType;
    comment: {
        beatmap_discussion_id?: number;
        beatmap_discussion_post_id?: number;
        old?: string | boolean;
        new?: string | boolean;
        beatmap_id?: number;
        beatmap_version?: string;
        new_user_id?: number;
        new_user_username?: string;
    };
    created_at: Date;
    user_id: number;
    beatmapset: BeatmapsetCompact;
    discussion?: BeatmapsetDiscussionCompact;
}

export interface Covers {
    cover: string;
    "cover@2x": string;
    card: string;
    "card@2x": string;
    list: string;
    "list@2x": string;
    slimcover: string;
    "slimcover@2x": string;
}

/**
 * Represents a beatmapset
 *
 * https://osu.ppy.sh/docs/index.html#beatmapsetcompact
 */

export interface BeatmapsetSearchResponse {
    beatmapsets: Beatmapset[];
    search: {
        sort: "relevance_desc";
    };
    recommended_difficulty?: number;
    error?: string;
    total: number;
    cursor: null;
    cursor_string?: string;
}

export type BeatmapNominations = {
    current: number;
    required: number;
};

export type BeatmapHypes = {
    current: number;
    required: number;
};

export type BeatmapRecentFavorites = {
    avatar_url: string;
    country_code: string;
    default_group: string;
    id: number;
    is_active: boolean;
    is_bot: boolean;
    is_deleted: boolean;
    is_online: boolean;
    is_supporter: boolean;
    last_visit: Date;
    pm_friends_only: boolean;
    profile_colour: null;
    username: string;
};

export interface BeatmapsetCompactBase {
    artist: string;
    artist_unicode: string;
    covers: Covers;
    creator: string;
    favourite_count: number;
    id: number;
    nsfw: boolean;
    play_count: number;
    preview_url: string;
    status: string;
    title: string;
    title_unicode: string;
    user_id: number;
    video: boolean;
    // Optional:
    beatmaps?: Beatmap[];
    converts?: unknown;
    current_user_attributes?: unknown;
    description?: unknown;
    discussions?: BeatmapsetDiscussion;
    events?: BeatmapsetEvent;
    genre?: string;
    language?: string;
    nominations: BeatmapNominations;
    ratings?: number[];
    recent_favourites: BeatmapRecentFavorites[];
    related_users?: unknown;
    user?: User;
}

export interface BeatmapsetDiscussionCompact {
    beatmap?: BeatmapCompact;
    beatmap_id: number;
    beatmapset: BeatmapsetCompact;
    beatmapset_id: number;
    can_grant_kudosu: boolean;
    created_at: Timestamp;
    current_user_attributes: unknown;
    deleted_at: Timestamp;
    deleted_by_id: number;
    id: number;
    kudosu_denied: boolean;
    last_post_at: Timestamp;
    message_type: string;
    parent_id: number;
    posts: BeatmapsetDiscussionPost[];
    resolved: boolean;
    starting_post: BeatmapsetDiscussionPostCompact;
    timestamp: number;
    updated_at: Timestamp;
    user_id: number;
}

export interface BeatmapsetDiscussion {
    beatmaps: Beatmap[];
    cursor_string: string;
    discussions: BeatmapsetDiscussionCompact[];
    posts: BeatmapsetDiscussionPostCompact[];
    included_discussions: BeatmapsetDiscussionCompact[];
    users: UserCompact[];
}

export interface BeatmapsetDiscussionResponse {
    status: number;
    data: BeatmapsetDiscussion;
}

export interface BeatmapsetDiscussionPost {
    beatmapsets: BeatmapsetCompact[];
    discussions: [BeatmapsetDiscussionCompact];
    posts: [BeatmapsetDiscussionPostCompact];
}

export interface BeatmapsetDiscussionPostResponse {
    status: number;
    data: BeatmapsetDiscussionPost;
}

export interface BeatmapsetDiscussionPostCompact {
    beatmapset_discussion_id: number;
    created_at: Timestamp;
    deleted_at: Timestamp;
    deleted_by_id: number;
    id: number;
    last_editor_id: number;
    message: string;
    system: boolean;
    updated_at: Timestamp;
    user_id: number;
}

export interface BeatmapsetDiscussionVote {
    beatmapset_discussion_id: number;
    created_at: Timestamp;
    id: number;
    score: number;
    updated_at: Timestamp;
    user_id: number;
}

export interface BeatmapsetDiscussionVoteResponse {
    status: number;
    data: {
        discussions: BeatmapsetDiscussion[];
        users: UserCompact[];
        votes: BeatmapsetDiscussionVote[];
    };
}

/**
 * Represents a beatmapset
 *
 * https://osu.ppy.sh/docs/index.html#beatmapsetcompact
 */
export interface BeatmapsetCompact extends BeatmapsetCompactBase {
    source: string;
    /** Always included in Betmapset */
    has_favourited?: boolean;
}

export interface BeatmapsetCompactAvailability {
    download_disabled: boolean;
    more_information?: string;
}

export interface BeatmapsetCompactHype {
    /** integer */
    current?: number;
    /** integer */
    required?: number;
}

export interface BeatmapsetCompactNominationsSummary {
    /** integer */
    current?: number;
    /** integer */
    required?: number;
}

export interface CompressedBeatmapset {
    id: number;
    hype: BeatmapsetCompactHype;
    nominations_summary: BeatmapsetCompactNominationsSummary;
    status: string;
    favorites: number;
    user_id: number;
}

export interface BeatmapNominationCompact {
    beatmapset_id: number;
    rulesets: GameModeName[];
    reset: boolean;
    user_id: number;
}

export interface Beatmapset extends BeatmapsetCompactBase {
    availability: BeatmapsetCompactAvailability;
    /** float */
    bpm: number;
    can_be_hyped: boolean;
    /**
     * Username of the mapper at the time of beatmapset creation
     */
    creator: string;
    discussion_enabled: boolean;
    discussion_locked: boolean;
    hype: null | BeatmapsetCompactHype;
    is_scoreable: boolean;
    last_updated: Timestamp;
    legacy_thread_url?: string;
    current_nominations: BeatmapNominationCompact[];
    nominations_summary: BeatmapsetCompactNominationsSummary;
    /**
     * See Rank status for list of possible values
     */
    ranked?: RankedStatus;
    ranked_date?: Timestamp;
    source?: string;
    storyboard: boolean;
    submitted_date: Timestamp;
    tags: string;

    has_favourited: boolean;
}

/**
 * Represent a beatmap.
 *
 * https://osu.ppy.sh/docs/index.html#beatmapcompact
 */
export interface BeatmapCompact {
    /** float */
    difficulty_rating: number;
    /** integer */
    id: number;
    mode: "osu" | "taiko" | "mania" | "fruits";
    /**
     * See Rank status for list of possible values.
     */
    status: string;
    total_length: number; // integer
    version: string;
    // Optional attributes:
    /**
     * Beatmapset for Beatmap object, BeatmapsetCompact for
     * BeatmapCompact object. null if the beatmap doesn't
     * have associated beatmapset (e.g. deleted).
     */
    beatmapset?: null | Beatmapset; // | BeatmapCompact
    checksum?: string;
    failtimes?: Failtimes;
    /** integer */
    max_combo?: number;
}

/**
 * Represent a beatmap.
 * This extends BeatmapCompact with additional attributes.
 *
 * https://osu.ppy.sh/docs/index.html#beatmap
 */
export interface Beatmap extends BeatmapCompact {
    /** float */
    accuracy: number;
    /** float */
    ar: number;
    /** integer */
    beatmapset_id: number;
    user_id: number;
    /** float */
    bpm: number;
    convert: boolean;
    /** integer */
    count_circles: number;
    /** integer */
    count_sliders: number;
    /** integer */
    count_spinners: number;
    /** float */
    cs: number;
    deleted_at?: Timestamp;
    /** float */
    drain: number;
    /** integer */
    hit_length: number;
    is_scoreable: boolean;
    last_updated: Timestamp;
    /** integer */
    mode_int: number;
    /** integer */
    passcount: number;
    /** integer */
    playcount: number;
    /**
     * See Rank status for list of possible values.
     *
     * integer
     */
    ranked: RankedStatus;
    url: string;
}

export interface BeatmapResponse {
    status: number;
    data: Beatmap;
}

export interface BeatmapsetResponse {
    status: number;
    data: Beatmapset;
}

export interface UserBeatmapetsResponse {
    status: number;
    data: {
        sets: Beatmapset[];
        last: Beatmapset;
        first: Beatmapset;
        sets_playcount: number;
        sets_favourites: number;
    };
}
