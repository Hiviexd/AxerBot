import type { Beatmap, Beatmapset } from "./beatmap";
import type { Timestamp } from "./timestamp";
import type { User } from "./user";
import { GameModeName } from "./game_mode";

/**
 * https://osu.ppy.sh/docs/index.html#score
 */
export interface ScoreStatistics {
	/** integer */
	count_50: number;
	/** integer */
	count_100: number;
	/** integer */
	count_300: number;
	/** integer */
	count_geki: number;
	/** integer */
	count_katu: number;
	/** integer */
	count_miss: number;
}

/**
 * https://osu.ppy.sh/docs/index.html#score
 */
export interface Score {
	/** integer */
	id: number;
	/** integer */
	best_id: number;
	/** integer */
	user_id: number;
	/** float */
	accuracy: number;
	mods: string[];
	/** integer */
	score: number;
	/** integer */
	max_combo: number;
	perfect: boolean;
	statistics: ScoreStatistics;
	passed: boolean;
	/** float */
	pp: number;
	rank: string;
	created_at: Timestamp;
	mode: GameModeName;
	/** integer */
	mode_int: number;
	replay: boolean;
	// Optional:
	beatmap?: Beatmap;
	beatmapset?: Beatmapset;
	//rank_country?: unknown
	//rank_global?: unknown
	//weight?: unknown
	user?: User;
	//match?: unknown
}

export interface UserScoreResponse {
	status: number;
	data: Score[];
}

/**
 * https://osu.ppy.sh/docs/index.html#beatmapuserscore
 */
export interface BeatmapUserScore {
	/**
	 * The position of the score within the requested beatmap ranking
	 */
	position: number;
	/**
	 * The details of the score.
	 */
	score: Score;
}
