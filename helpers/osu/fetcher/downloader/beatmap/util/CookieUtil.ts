export interface Cookie {
	name?: string;
	value: string;
	expires?: Date;
	maxAge?: number;
}

export interface Cookies {
	[name: string]: Cookie[];
}

export function parseCookies(raws: string[], decode = true): Cookies {
	let cookies = raws.map((raw) => parseCookieString(raw, decode));
	let result: any = {};
	for (const cookie of cookies) {
		const { name }: any = cookie;

		if (result[name] === undefined) {
			result[name] = [cookie];
		} else {
			result[name].push(cookie);
		}
	}
	return result;
}

export function parseCookieString(
	rawCookie: string,
	decode: boolean = true
): Cookie {
	let parts: any = rawCookie.split(";").filter((value) => value !== "");
	let [name, ...trials] = parts.shift().split("=");
	let value = trials.join("=");
	if (decode) {
		value = decodeURIComponent(value);
	}
	let cookie: any = { name, value };
	for (const part of parts) {
		let sides = part.split("=");
		let key = sides.shift().trimLeft().toLowerCase();
		let value = sides.join("=");
		switch (key.toLowerCase()) {
			case "expires":
				cookie.expires = new Date(value);
				break;
			case "max-age":
				cookie.maxAge = parseInt(value);
				break;
			default:
				cookie[key] = value === "" ? true : value;
				break;
		}
	}
	return cookie;
}

export function wrapCookies(parsedCookies: Cookies): string {
	return Object.entries(parsedCookies)
		.map(
			([name, cookies]) =>
				name +
				"=" +
				cookies
					.filter(
						(cookie) =>
							(cookie.expires &&
								cookie.expires.getTime() > Date.now()) ||
							(cookie.maxAge && cookie.maxAge > 0)
					)
					.map((cookie) => cookie.value)
					.join(";")
		)
		.join(";");
}
