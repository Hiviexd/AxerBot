export function getMods(message: string) {
    const mods: string[] = [];

    const modsList: { acronym: string; match: string }[] = [
        { acronym: "DT", match: "+DoubleTime" },
        { acronym: "NC", match: "+Nightcore" },
        { acronym: "HD", match: "+Hidden" },
        { acronym: "HR", match: "+HardRock" },
        { acronym: "FL", match: "+Flashlight" },
        { acronym: "EZ", match: "-Easy" },
        { acronym: "HT", match: "-HalfTime" },
        { acronym: "NF", match: "-NoFail" },
        { acronym: "SD", match: "+SuddenDeath" },
        { acronym: "PF", match: "+Perfect" },
    ];

    message.split(" ").forEach((arg) => {
        arg = arg.trim();

        if (arg.startsWith("+") || arg.startsWith("-")) {
            const targetMod = modsList.find((m) => m.match == arg);

            if (targetMod) mods.push(targetMod.acronym);
        }
    });

    return mods;
}
