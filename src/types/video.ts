import { InstaDownloaders, YTDownloaders } from '.';

export enum VideoService {
  IG = 'instagram',
  YT = 'youtube',
}

export interface VideoInfo {
  url: string;
  width: number;
  height: number;
  thumbnail: string;
  duration: number;
  service: VideoService;
  downloadVia: InstaDownloaders | YTDownloaders;
}
