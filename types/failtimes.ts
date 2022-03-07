/**
 * All fields are optional but there's always at least one field returned.
 *
 * https://osu.ppy.sh/docs/index.html#beatmapcompact-failtimes
 */
export interface Failtimes {
    /** Array of length 100. */
    exit?: number[]
    /** Array of length 100. */
    fail?: number[]
}
