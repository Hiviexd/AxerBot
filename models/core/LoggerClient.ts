import "colors";

export class LoggerClient {
    private module: string;

    constructor(module: string) {
        this.module = module;
    }

    public printSuccess(message: string) {
        console.log(
            new Date().toLocaleTimeString() +
                " " +
                `[${this.module}]`.bgYellow.black +
                `${message}`.bgGreen.black
        );
    }

    public printError(message: string, error?: any) {
        console.error(
            new Date().toLocaleTimeString() +
                " " +
                `[${this.module}]`.bgYellow.black +
                `${message}`.bgRed.black
        );
        error ? console.error(error) : void {};
    }

    public printInfo(message: string) {
        console.info(
            new Date().toLocaleTimeString() +
                " " +
                `[${this.module}]`.bgYellow.black +
                `${message}`.bgCyan.black
        );
    }

    public printWarning(message: string) {
        console.warn(
            new Date().toLocaleTimeString() +
                `[${this.module}]`.bgYellow.black +
                `${message}`.bgYellow.black
        );
    }
}
