declare module "fluent-ffmpeg" {
  interface FfmpegCommand {
    inputOptions(options: string[]): FfmpegCommand;
    outputOptions(options: string | string[]): FfmpegCommand;
    output(path: string): FfmpegCommand;
    on(event: string, callback: (...args: any[]) => void): FfmpegCommand;
    run(): void;
    seekInput(offset: number): FfmpegCommand;
  }
  function ffmpeg(input?: string): FfmpegCommand;
  namespace ffmpeg {
    function setFfmpegPath(path: string): void;
    function setFfprobePath(path: string): void;
    function ffprobe(path: string, callback: (err: Error | null, data: unknown) => void): void;
  }
  export = ffmpeg;
}
