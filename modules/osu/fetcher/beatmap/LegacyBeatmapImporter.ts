import path from "path";

export class LegacyBeatmapsetImporter {
    private OSZ;
    private ImportFolder = path.resolve("./temp/beatmapsets/");

    constructor(osz: Buffer) {
        this.OSZ = osz;
    }

    import() {}
}
