import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";
import Downloader from "../struct/Downloader";

const FILENAME_EXTRACTOR = /filename\*?=["]?(?:UTF-\d["]*)?([^;\r\n"]*)["]?;?/i;

export default class FetchDownloader extends Downloader {
	readonly #response: Promise<Response>;

	constructor(input: RequestInfo, init: RequestInit) {
		super();
		this.#response = fetch(input, init);
	}

	async buffer(): Promise<Buffer> {
		return (await this.#response).buffer();
	}

	async name(): Promise<string> {
		const response = await this.#response;
		const headers = response.headers.get("Content-Disposition");
		if (headers != null) {
			const uri = decodeURIComponent(headers).match(FILENAME_EXTRACTOR);

			if (uri != null) return uri[1];
		}

		const url = new URL(response.url);
		const paths = decodeURIComponent(url.pathname).split("/");
		return paths.length === 1 ? url.hostname : paths[paths.length - 1];
	}

	async size(): Promise<number> {
		const length = (await this.#response).headers.get("Content-Length");

		if (length == null) return 0;

		return parseInt(length);
	}

	async stream(): Promise<NodeJS.ReadableStream> {
		return (await this.#response).body;
	}

	async mime(): Promise<string> {
		const response = await this.#response;
		const contenttype = response.headers.get("Content-Type");

		if (contenttype == null) return "/*";

		return contenttype;
	}
}
