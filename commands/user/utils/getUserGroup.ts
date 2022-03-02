export default function getUserGroup(mapper: any) {
	let group: any = {
		name: "mpr",
		mapper: true,
		colour: "#3986ac",
	};

	const groups: Array<any> = mapper.groups;

	groups.forEach((g) => {
		switch (g.short_name) {
			case "BN":
				group = {
					name: g.short_name,
					colour: g.colour,
					icon: "https://cdn.discordapp.com/role-icons/575105878638854154/f278c2b2ab42b051bab99d6e74818d3c.webp?quality=lossless",
				};
				break;
			case "NAT":
				group = {
					name: g.short_name,
					colour: g.colour,
					icon: "https://cdn.discordapp.com/role-icons/575472166095683584/7e6509ec2a48c0568787ca61eec69a0a.webp?quality=lossless",
				};
			case "LVD":
				group = {
					name: g.short_name,
					colour: g.colour,
					icon: "https://cdn.discordapp.com/role-icons/865023823162507285/b012ae5a2f2a5bb319f02107a73522de.webp?quality=lossless",
				};
				break;
		}
	});

	return group;
}
