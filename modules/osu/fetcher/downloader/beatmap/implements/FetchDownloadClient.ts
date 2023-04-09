import DownloadClient from "../struct/DownloadClient";
import Downloader from "../struct/Downloader";
import FetchDownloader from "./FetchDownloader";

export default class FetchDownloadClient extends DownloadClient {
	download(
		url: URL,
		opts: { headers: { cookie: string; referer: string } }
	): Downloader {
		return new FetchDownloader(url, opts);
	}
}
