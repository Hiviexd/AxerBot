export default abstract class Downloader {
  abstract buffer(): Promise<Buffer>;

  abstract stream(): Promise<NodeJS.ReadableStream>;

  abstract size(): Promise<number>;

  abstract name(): Promise<string>;

  abstract mime(): Promise<string>;
}