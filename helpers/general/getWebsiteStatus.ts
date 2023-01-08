/**
 * ? returns the status code of a website
 */

export default async (url: string) => {
	return new Promise((resolve, reject) => {
		const req = require("https").request(url, (res: any) => {
			resolve(res.statusCode);
		});
		req.on("error", (err: any) => {
			resolve(502);
		});
		req.end();
	});
};
