import { default as _DownloadClient } from "./struct/DownloadClient";
import { default as _Downloader } from "./struct/Downloader";
import { default as _OsuBeatmapsetDownloader } from "./struct/OsuBeatmapsetDownloader";

import { default as _FetchDownloadClient } from "./implements/FetchDownloadClient";
import { default as _FetchDownloader } from "./implements/FetchDownloader";
import { default as _OsuOfficialDownloader } from "./implements/OsuOfficialDownloader";

import {
	advancedLogin as _advancedLogin,
	checkSession as _checkSession,
	login as _login,
} from "./util/OsuAuthenticator";

export const DownloadClient = _DownloadClient;
export const Downloader = _Downloader;
export const OsuBeatmapsetDownloader = _OsuBeatmapsetDownloader;

export const FetchDownloadClient = _FetchDownloadClient;
export const FetchDownloader = _FetchDownloader;
export const OsuOfficialDownloader = _OsuOfficialDownloader;

export namespace OsuAuthenticator {
	export const login = _login;
	export const advancedLogin = _advancedLogin;
	export const checkSession = _checkSession;
}
