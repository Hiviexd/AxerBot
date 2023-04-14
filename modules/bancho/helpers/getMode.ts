export function getMode(message: string) {
    const modes: { [key: string]: number | undefined } = {
        "<Taiko>": 1,
        "<CatchTheBeat>": 2,
        "<osu!mania>": 3,
    };

    let mode = null;

    message.split(" ").forEach((arg) => {
        if (modes[arg]) mode = modes[arg];
    });

    return mode;
}
