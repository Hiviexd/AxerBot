import { spawn } from "child_process";

interface AudioPropertiesOutput {
    bitRate: number;
    sampleRate: number;
    format: string;
    [key: string]: number | string;
}

export class FFProbe {
    public fileInput: string;

    constructor(fileInput: string) {
        this.fileInput = fileInput;
    }

    getAudioProperties(): Promise<AudioPropertiesOutput> {
        return new Promise((resolve, reject) => {
            const ffprobe = spawn("ffprobe", [
                "-v",
                "error",
                "-select_streams",
                "a:0",
                "-show_entries",
                "stream=bit_rate,sample_rate,format:format=name",
                "-of",
                "json",
                this.fileInput,
            ]);

            let stdoutData = "";

            ffprobe.stdout.on("data", (data) => {
                stdoutData += data.toString();
            });

            ffprobe.on("close", (code) => {
                if (code === 0) {
                    try {
                        const jsonData = JSON.parse(stdoutData);
                        const audioInfo = jsonData.streams[0];
                        const formatInfo = jsonData.format;

                        const result = {
                            bitRate: audioInfo.bit_rate,
                            sampleRate: audioInfo.sample_rate,
                            format: formatInfo.name,
                        };

                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error(`ffprobe process exited with code ${code}`));
                }
            });

            ffprobe.on("error", (err) => {
                reject(err);
            });
        });
    }
}
