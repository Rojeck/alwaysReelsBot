import { InstaDownloaders } from '.';

export enum VideoService {
  IG = 'instagram',
}

export interface VideoInfo {
  url: string;
  width: number;
  height: number;
  thumbnail: string;
  duration: number;
  service: VideoService;
  downloadVia: InstaDownloaders;
}
