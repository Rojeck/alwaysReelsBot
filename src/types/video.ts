import { InstaDownloaders, YTDownloaders } from '.';
import { TikTokDownloaders } from './tiktok';

export enum VideoService {
  IG = 'instagram',
  YT = 'youtube',
  TT = 'tiktok',
}

export interface VideoInfo {
  url: string;
  width: number;
  height: number;
  thumbnail?: string;
  duration: number;
  service: VideoService;
  useStream?: boolean;
  downloadVia: InstaDownloaders | YTDownloaders | TikTokDownloaders;
}
