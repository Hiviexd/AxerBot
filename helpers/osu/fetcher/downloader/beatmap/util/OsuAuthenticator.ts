import fetch, {Headers} from "node-fetch";
import {Cookies, parseCookies, wrapCookies} from "./CookieUtil";

export interface AdvancedLoginResult {
  cookie: Cookies;
  data: object;
}

export interface AccountInfo {
  username: string;
  password: string;
}

let token;

export async function advancedLogin(account: AccountInfo): Promise<AdvancedLoginResult> {
  const home = await fetch("https://osu.ppy.sh/home", {
    method: "HEAD"
  });
  if (home.status !== 200) throw new Error(home.status + " " + home.statusText);
  const cookies = parseCookies(home.headers.raw()["set-cookie"]);
  const headers = new Headers();
  headers.set("Cookie", wrapCookies(cookies));
  headers.set("Referer", "https://osu.ppy.sh/home");
  headers.set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  const body = new URLSearchParams();
  body.append("_token", token = cookies["XSRF-TOKEN"][0].value);
  body.append("username", account.username);
  body.append("password", account.password);
  const session = await fetch("https://osu.ppy.sh/session", {
    method: "POST",
    headers, body
  });
  if (home.status !== 200) throw new Error(session.status + " " + session.statusText);
  return {
    cookie: parseCookies(session.headers.raw()["set-cookie"]),
    data: await session.json(),
  };
}

export function login(account: AccountInfo): Promise<string> {
  return advancedLogin(account).then(res => res.cookie["osu_session"][0].value);
}

export async function checkSession(cookie: Cookies): Promise<boolean> {
  const response = await fetch("https://osu.ppy.sh/home/friends", {
    method: "HEAD",
    headers: {
      cookie: wrapCookies(cookie)
    }
  });
  return response.status === 200;
}