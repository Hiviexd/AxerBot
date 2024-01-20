import { BeatmapRateChanger } from "./ratechanger/BeatmapRateChanger";
import { BeatmapSvScaler } from "./svscaler/BeatmapSvScaler";

export class BeatmapEditor {
    public static get RateChanger() {
        return BeatmapRateChanger;
    }

    public static get SvScaler() {
        return BeatmapSvScaler;
    }
}
