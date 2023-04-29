import { Canvas, loadImage } from "canvas";

export interface ITaikoNote {
    type: "k" | "d";
    finisher: boolean;
    snap: number;
}

export class TaikoPattern extends Canvas {
    public notes: ITaikoNote[] = [];
    private snapSize = {
        2: 10,
        3: 8,
        4: 0,
        6: -6,
        8: -10,
    } as { [key: number]: number };
    private static noteWidth = 35;
    private static finisherWidth = 50;

    public ctx;

    constructor(pattern: string) {
        super(
            TaikoPattern.getCanvasWidth(TaikoPattern.parsePatterns(pattern)),
            50
        );

        this.ctx = this.getContext("2d");

        this.notes = TaikoPattern.parsePatterns(pattern);
    }

    public async render() {
        const kat = await loadImage(
            "https://media.discordapp.net/attachments/959908232736952420/1100907929097490493/katsu.png"
        );
        const don = await loadImage(
            "https://media.discordapp.net/attachments/959908232736952420/1100907929307189439/don.png"
        );

        let x = 0;
        for (const note of this.notes) {
            this.ctx.drawImage(note.type == "k" ? kat : don, x, 0);

            x +=
                this.snapSize[note.snap] +
                (note.finisher
                    ? TaikoPattern.finisherWidth
                    : TaikoPattern.noteWidth + TaikoPattern.noteWidth);
        }

        return this.toBuffer();
    }

    public static getCanvasWidth(notes: ITaikoNote[]) {
        let width = 0;
        let snaps = {
            2: 10,
            3: 8,
            4: 0,
            6: -6,
            8: -10,
        } as { [key: number]: number };

        for (const note of notes) {
            width +=
                snaps[note.snap] +
                (note.finisher
                    ? TaikoPattern.finisherWidth
                    : TaikoPattern.noteWidth);
        }

        return width;
    }

    public static parsePatterns(pattern: string) {
        let notes: ITaikoNote[] = [];

        let snap = 4;
        let lastNote = "";

        pattern
            .split("")
            .filter((char) =>
                [
                    " ",
                    "k",
                    "d",
                    "K",
                    "D",
                    "<",
                    ">",
                    "[",
                    "]",
                    "(",
                    ")",
                ].includes(char)
            )
            .forEach((note, index) => {
                if (lastNote == "(") snap = 6;
                if (lastNote == ")") snap = 4;
                if (lastNote == "[") snap = 8;
                if (lastNote == "]") snap = 4;
                if (lastNote == "<") snap = 3;
                if (lastNote == ">") snap = 4;

                if (["d", "k"].includes(note) && ![6, 3, 8].includes(snap))
                    snap = 4;

                if (index == 0 && ["d", "k"].includes(pattern[2])) snap = 4;

                if (index == 0 && pattern[3] == " ") snap = 2;

                if (lastNote == " ") snap = 2;

                lastNote = note;

                if (["d", "k", "D", "K"].includes(note))
                    notes.push({
                        type: note.toLowerCase() as "k" | "d",
                        snap: snap,
                        finisher: ["D", "K"].includes(note),
                    });
            });

        return notes;
    }
}
