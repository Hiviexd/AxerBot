/**
 * Available game modes:
 *
 * https://osu.ppy.sh/docs/index.html#gamemode
 */
export enum GameMode {
	/** osu!standard */
	osu = 0,
	/** osu!taiko */
	taiko = 1,
	/** osu!catch */
	fruits = 2,
	/** osu!mania */
	mania = 3,
}

export type GameModeName = "osu" | "taiko" | "mania" | "fruits";
