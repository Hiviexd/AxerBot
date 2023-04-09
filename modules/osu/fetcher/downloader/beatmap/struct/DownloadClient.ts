import Downloader from "./Downloader";

export default abstract class DownloadClient {
	abstract download(
		url: URL,
		opts: { headers: { cookie: string; referer: string } }
	): Downloader;
}
