/**
 * Available game modes:
 *
 * https://osu.ppy.sh/docs/index.html#gamemode
 */
export enum GameMode {
	/** osu!catch */
	fruits = 2,
	/** osu!mania */
	mania = 1,
	/** osu!standard */
	osu = 0,
	/** osu!taiko */
	taiko = 3,
}

export type GameModeName = "osu" | "taiko" | "mania" | "fruits";
