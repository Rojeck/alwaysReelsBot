import { InstaDownloaders, YTDownloaders } from '.';
import { TikTokDownloaders } from './tiktok';

export enum VideoService {
  IG = 'Instagram',
  YT = 'YouTube',
  TT = 'TikTok',
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
