import {
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    rmdirSync,
    unlinkSync,
    writeFileSync,
} from "fs";
import { Beatmap } from "osu-classes";
import { BeatmapDecoder } from "osu-parsers";
import path from "path";
import { EventEmitter } from "ws";
import yauzl from "yauzl";

export class LegacyBeatmapsetImporter extends EventEmitter {
    private OSZ;
    private ImportFolder = path.resolve("./temp/beatmapsets/");
    private BeatmapsetId: string;
    public Beatmaps: Beatmap[] = [];

    constructor(osz: Buffer, beatmapsetId: string) {
        super();

        this.OSZ = osz;

        this.BeatmapsetId = beatmapsetId;

        this.validateTempFolders();

        writeFileSync(
            path.join(this.ImportFolder, beatmapsetId).concat(".zip"),
            osz
        );
    }

    private getBeatmapsetId() {
        return this.BeatmapsetId;
    }

    private getImportFolder() {
        return this.ImportFolder;
    }

    public loadBeatmaps() {
        const beatmapFiles = readdirSync(
            path.join(this.getImportFolder(), this.getBeatmapsetId())
        ).filter((file) => file.endsWith(".osu"));

        const decoder = new BeatmapDecoder();

        for (const beatmapFile of beatmapFiles) {
            const fileContent = readFileSync(
                path.join(
                    this.getImportFolder(),
                    this.getBeatmapsetId(),
                    beatmapFile
                ),
                "utf8"
            );

            const mapData = decoder.decodeFromString(fileContent, {
                parseStoryboard: false,
            });

            this.Beatmaps.push(mapData);
        }

        return this.Beatmaps;
    }

    public getBeatmaps() {
        return this.Beatmaps;
    }

    public getAudioFileFrom(beatmapId: number) {
        try {
            const mapData = this.Beatmaps.find(
                (b) => b.metadata.beatmapId == beatmapId
            );

            if (!mapData) return null;

            return readFileSync(
                path.join(
                    this.getImportFolder(),
                    this.getBeatmapsetId(),
                    mapData.general.audioFilename
                )
            );
        } catch (e) {
            console.error(e);

            return null;
        }
    }

    import() {
        this.createFolders.bind(this);
        this.getBeatmapsetId.bind(this);
        this.getImportFolder.bind(this);
        this.deleteOsz.bind(this);
        this.deleteBeatmap.bind(this);
        this.emit.bind(this);

        try {
            yauzl.open(
                path
                    .join(this.getImportFolder(), this.getBeatmapsetId())
                    .concat(".zip"),
                { lazyEntries: true },
                (err, zipfile) => {
                    if (err) throw err;

                    zipfile.readEntry();

                    zipfile.on("entry", (entry) => {
                        /// * Check if the entry is a folder
                        if (entry.fileName.split("/").length != 1) {
                            this.createFolders(
                                entry.fileName
                                    .split("/")
                                    .filter((p: string) => p.trim() != "")
                                    .map((p: string) => p.trim())
                            );
                        }

                        if (/\/$/.test(entry.fileName)) {
                            zipfile.readEntry();
                        } else {
                            const destinationStream = createWriteStream(
                                path.join(
                                    this.getImportFolder(),
                                    this.getBeatmapsetId(),
                                    entry.fileName
                                )
                            );

                            zipfile.openReadStream(entry, (err, readStream) => {
                                if (err) throw err;
                                readStream.on("end", function () {
                                    zipfile.readEntry();
                                });
                                readStream.pipe(destinationStream);
                            });
                        }
                    });

                    zipfile.on("end", () => {
                        zipfile.close();
                        this.deleteOsz();
                        this.emit("end");
                    });
                }
            );
        } catch (e) {
            this.emit("error", e);
        }
    }

    public deleteOsz() {
        unlinkSync(
            path
                .join(this.getImportFolder(), this.getBeatmapsetId())
                .concat(".zip")
        );
    }

    private createFolders(paths: string[]) {
        paths.pop(); /// * remove filename from path

        const target = [] as string[];

        for (const _path of paths) {
            target.push(_path);

            if (
                !existsSync(
                    path.join(this.ImportFolder, this.BeatmapsetId, _path)
                )
            )
                mkdirSync(
                    path.join(this.ImportFolder, this.BeatmapsetId, _path)
                );
        }
    }

    public deleteBeatmap() {
        rmdirSync(path.join(this.ImportFolder, this.BeatmapsetId), {
            recursive: true,
        });
    }

    private validateTempFolders() {
        if (!existsSync(path.resolve(this.ImportFolder)))
            mkdirSync(this.ImportFolder);

        if (existsSync(path.join(this.ImportFolder, this.BeatmapsetId)))
            this.deleteBeatmap();

        mkdirSync(path.join(this.ImportFolder, this.BeatmapsetId));
    }
}
