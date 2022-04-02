import DownloadClient from "./DownloadClient";
import Downloader from "./Downloader";

export interface BeatmapsetDownloadOptions {
  beatmapsetId: string | number,
  noVideo?: boolean
}

export default abstract class OsuBeatmapsetDownloader {
  readonly client: DownloadClient;

  protected constructor(client: DownloadClient) {
    this.client = client;
  }

  abstract download(options: BeatmapsetDownloadOptions): Downloader;
}