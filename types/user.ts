import type { Timestamp } from "./timestamp";
import { GameMode } from "./game_mode";
import { ColorResolvable } from "discord.js";
import { Beatmapset } from "./beatmap";

export interface UserCompactCover {
	custom_url: null | unknown;
	url: string;
	id: string;
}

/**
 * https://osu.ppy.sh/docs/index.html#user-profilepage
 */
export interface ProfilePage {
	me: unknown;
	recent_activity: unknown;
	beatmaps: unknown;
	historical: unknown;
	kudosu: unknown;
	top_ranks: unknown;
	medals: unknown;
}

export interface UserResponse {
	status: number;
	data: User;
}

export interface UserStatisticsRulesets {
	todo?: boolean;
}

export interface UserMonthlyPlaycount {
	todo?: boolean;
}

export interface CommentUser {
	avatar_url: string;
	country_code: string;
	default_group: string;
	id: number;
	is_active: boolean;
	is_bot: boolean;
	is_deleted: boolean;
	is_online: boolean;
	is_supporter: boolean;
	last_visit: Timestamp;
	pm_friends_only: boolean;
	profile_colour: string;
	username: string;
}

export interface UserGroup {
	colour: string;
	has_listing: boolean;
	has_playmodes: boolean;
	id: number;
	identifier: string;
	is_probationary: boolean;
	name: string;
	short_name: string;
}

export interface EmbededUserGroup {
	colour: ColorResolvable;
	icon: string;
	has_listing?: boolean;
	has_playmodes?: boolean;
	id?: number;
	identifier?: string;
	is_probationary?: boolean;
	name?: string;
	short_name?: string;
}

export interface UserAccountHistory {
	todo?: boolean;
}

export interface UserCompactProfileBanner {
	todo?: boolean;
}

export interface UserBadge {
	awarded_at: Timestamp;
	description: string;
	image_url: string;
	url: string;
}

export interface UserCompactCountry {
	code: string;
	name: string;
}

export interface UserCompactStatisticsLevel {
	current: number;
	progress: number;
}

export interface UserCompactStatisticsGradeCounts {
	ss: number;
	ssh: number;
	s: number;
	sh: number;
	a: number;
}

export interface UserCompactStatisticsRank {
	country: number;
}

export interface UserCompactStatistics {
	level: UserCompactStatisticsLevel;
	global_rank: number;
	pp: number;
	ranked_score: number;
	hit_accuracy: number;
	play_count: number;
	play_time: number;
	total_score: number;
	total_hits: number;
	maximum_combo: number;
	replays_watched_by_others: number;
	is_ranked: true;
	grade_counts: UserCompactStatisticsGradeCounts;
	country_rank: number;
	rank: UserCompactStatisticsRank;
}

export interface UserAchievement {
	achieved_at: Timestamp;
	achievement_id: number;
}

/**
 * Mainly used for embedding in certain responses to save additional api lookups.
 *
 * https://osu.ppy.sh/docs/index.html#usercompact
 */
export interface UserCompactBase {
	/**
	 * url of user's avatar
	 */
	avatar_url: string;
	/**
	 * two-letter code representing user's country
	 */
	country_code: string;
	/**
	 * Identifier of the default Group the user belongs to
	 */
	default_group: string;
	/**
	 * unique identifier for user
	 */
	id: number;
	/**
	 * has this account been active in the last x months?
	 */
	is_active: boolean;
	/**
	 * is this a bot account?
	 */
	is_bot: boolean;
	is_deleted: boolean;
	/**
	 * is the user currently online? (either on lazer or the new website)
	 */
	is_online: boolean;
	/**
	 * does this user have supporter?
	 */
	is_supporter: boolean;
	/**
	 * last access time. null if the user hides online presence
	 */
	last_visit?: Timestamp;
	/**
	 * whether or not the user allows PM from other than friends
	 */
	pm_friends_only: boolean;
	/**
	 * colour of username/profile highlight, hex code (e.g. #333333)
	 */
	profile_colour: string;
	/**
	 * user's display name
	 */
	username: string;
	// Optional:
	account_history?: UserAccountHistory[];
	active_tournament_banner?: UserCompactProfileBanner;
	badges?: UserBadge[];
	beatmap_playcounts_count?: number;
	blocks?: unknown;
	favourite_beatmapset_count?: number;
	follower_count?: number;
	mapping_follower_count?: number;
	friends?: unknown;
	graveyard_beatmapset_count?: number;
	ranked_and_approved_beatmapset_count?: number;
	groups?: UserGroup[];
	loved_beatmapset_count?: number;
	monthly_playcounts?: UserMonthlyPlaycount[];
	page?: unknown;
	pending_beatmapset_count?: unknown;
	previous_usernames?: unknown;
	rank_history?: {
		data?: number[];
	};
	ranked_beatmapset_count?: unknown;
	guest_beatmapset_count?: number;
    nominated_beatmapset_count?: number;
	replays_watched_counts?: unknown;
	scores_best_count?: number;
	scores_first_count?: number;
	scores_recent_count?: number;
	statistics?: UserCompactStatistics;
	statistics_rulesets: UserStatisticsRulesets;
	support_level?: unknown;
	unread_pm_count?: unknown;
	user_achievements?: UserAchievement[];
	user_preferences?: unknown;
}

/**
 * Mainly used for embedding in certain responses to save additional api lookups.
 *
 * https://osu.ppy.sh/docs/index.html#usercompact
 */
export interface UserCompact extends UserCompactBase {
	/** This is included in a User object! */
	country?: UserCompactCountry;
	/** This is included in a User object! */
	cover?: UserCompactCover;
	/** This is included in a User object! */
	is_restricted?: boolean;
}

export interface UserCompactKusodo {
	available: number;
	total: number;
}

export interface UserCompactCountry {
	name: string;
	code: string;
}

/**
 * Represents a User. Extends UserCompact object with additional attributes.
 *
 * https://osu.ppy.sh/docs/index.html#user
 */
export interface User extends UserCompactBase {
	discord?: string;
	/**
	 * whether or not ever being a supporter in the past
	 */
	has_supported: boolean;
	interests?: string;
	join_date: Timestamp;
	kudosu: UserCompactKusodo;
	location?: string;
	/**
	 * maximum number of users allowed to be blocked
	 */
	max_blocks?: number;
	/**
	 * maximum number of friends allowed to be added
	 */
	max_friends: number;
	occupation?: string;
	playmode: GameMode;
	/**
	 * Device choices of the user
	 */
	playstyle: string[];
	/**
	 * number of forum posts
	 *
	 * integer
	 */
	post_count: number;
	/**
	 * ordered array of sections in user profile page
	 */
	profile_order: ProfilePage[];
	/**
	 * user-specific title
	 */
	title?: string;
	title_url?: string;
	twitter?: string;
	website?: string;

	cover: UserCompactCover;
	country: UserCompactCountry;
	is_restricted: boolean;
}
