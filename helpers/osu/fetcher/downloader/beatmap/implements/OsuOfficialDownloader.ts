import OsuBeatmapsetDownloader, {
	BeatmapsetDownloadOptions,
} from "../struct/OsuBeatmapsetDownloader";
import DownloadClient from "../struct/DownloadClient";
import Downloader from "../struct/Downloader";

export default class OsuOfficialDownloader extends OsuBeatmapsetDownloader {
	#osu_session: string;

	constructor(client: DownloadClient, osu_session: string) {
		super(client);
		this.#osu_session = osu_session;
	}

	getSession(): string {
		return this.#osu_session;
	}

	setSession(osu_session: string) {
		this.#osu_session = osu_session;
	}

	download(options: BeatmapsetDownloadOptions): Downloader {
		const url = new URL(
			`https://osu.ppy.sh/beatmapsets/${options.beatmapsetId}/download?noVideo=1`
		);

		const headers = {
			cookie: `osu_session=${this.#osu_session}`,
			referer: url.href,
		};
		return this.client.download(url, { headers });
	}
}
