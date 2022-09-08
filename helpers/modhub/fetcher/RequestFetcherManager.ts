import axios from "axios";

export default class {
	public static BaseURL = "https://osumodhub.xyz/api/requests/";

	public static async fetchRequest(request_id: string) {
		const r = await axios(this.BaseURL.concat(request_id));

		return r;
	}
}
