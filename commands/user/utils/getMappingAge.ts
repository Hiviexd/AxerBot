import parseDate from "../../../utils/messages/parseDate";

export default function getMappingAge(beatmaps: any) {
	return parseDate(
		new Date(
			new Date().getTime() -
				new Date(beatmaps.first.submitted_date).getTime()
		)
	);
}
