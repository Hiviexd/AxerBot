import { EmbededUserGroup, User } from "../../../types/user";
import { readFileSync } from "fs";
import { resolve } from "path";

export default function parseUsergroup(mapper: User): EmbededUserGroup {
	const getIcon = (name: string) => {
		return `https://raw.githubusercontent.com/Hiviexd/AxerBot/refs/heads/main/assets/icons/${name}.png`;
	}

    const userGroupInfo: any = {
        PPY: {
            index: 0,
            name: "ppy",
            icon: getIcon("ppy"),
            colour: "#0066FF",
        },
        SPT: {
            index: 1,
            name: "Technical Support Team",
            icon: getIcon("spt"),
            colour: "#ebd047",
        },
        DEV: {
            index: 2,
            name: "Developer",
            icon: getIcon("dev"),
            colour: "#E45678",
        },
        GMT: {
            index: 3,
            name: "Global Moderator",
            icon: getIcon("gmt"),
            colour: "#99eb47",
        },
        NAT: {
            index: 4,
            name: "Nomination Assessment Team",
            icon: getIcon("nat"),
            colour: "#fa3703",
        },
        TC: {
            index: 5,
            name: "Tournament Committee",
            icon:  getIcon("tc"),
            colour: "#FFB969",
        },
        FA: {
            index: 6,
            name: "Featured Artist",
            colour: "#00ffff",
            icon:  getIcon("fa"),
        },
        BN: {
            index: 7,
            name: "Beatmap Nominator",
            icon:  getIcon("bn"),
            probationary: {
                name: "Beatmap Nominator (Probationary)",
                icon:  getIcon("bn-probation"),
                colour: "#d6c8fc",
            },
            elite: {
                name: "Elite Nominator",
                icon:  getIcon("bn-elite"),
                colour: "#FFAB23",
            },
        },
        ALM: {
            index: 8,
            name: "osu! Alumni",
            icon: getIcon("alm"),
            colour: "#999999",
        },
        LVD: {
            index: 9,
            name: "Project Loved",
            icon:  getIcon("lvd"),
            colour: "#ffd1dc",
        },
        BSC: {
            index: 10,
            name: "Beatmap Spotlight Curator",
            icon: getIcon("bsc"),
            colour: "#76AEBC",
        },
        BOT: {
            index: 11,
            name: "BOT",
            colour: "#ffffff",
            icon: getIcon("bot"),
        },
    };

    const usergroups = mapper.groups;

    if (!usergroups)
        return {
            icon: "",
            colour: "#1b89d3",
        };

    let groups = new Array(usergroups?.length);

    // ? Sort usergroups
    usergroups?.forEach((g) => {
        const index = userGroupInfo[g.short_name].index;
        groups[index] = g;
        groups[index].index = index;
        groups[index].icon = userGroupInfo[g.short_name].icon;

        //if (g.short_name == "PPY") g.colour = "#eb47d0";

        if (g.is_probationary) {
            groups[index].colour = userGroupInfo[g.short_name].probationary.colour;
            groups[index].icon = userGroupInfo[g.short_name].probationary.icon;
        }

        if (g.short_name == "BN" && mapper.title?.includes("Elite Nominator")) {
            groups[index].colour = userGroupInfo[g.short_name].elite.colour;
            groups[index].icon = userGroupInfo[g.short_name].elite.icon;
        }
    });

    if (!groups)
        return {
            icon: "",
            colour: "#1b89d3",
        };

    if (groups.length > 0) {
        groups.sort((a, b) => {
            return a - b;
        });

        let group: EmbededUserGroup = groups[0];

        return group;
    } else {
        return {
            icon: "",
            colour: "#1b89d3",
        };
    }
}
