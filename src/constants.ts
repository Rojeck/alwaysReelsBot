import { VideoService } from './types';
import * as path from 'path';

export const defaultVideoInfo = {
  width: 1080,
  height: 1920,
  duration: 0,
};

export const YT_DLP_BINARY_PATH = path.resolve(
  __dirname,
  '..',
  'bin',
  'yt-dlp',
);
export const YT_DLP_PLATFORM = 'darwin';

export const servicesPatterns = {
  [VideoService.IG]:
    /^https:\/\/(?:www\.)?instagram\.com\/(?:share\/reel|reels?)\/([a-zA-Z0-9_-]+)\/?/,
  // [VideoService.YT]:
  //   /^https:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)\/?/,
  [VideoService.TT]:
    /(?<=\/video\/)\d+|(?<=https:\/\/(?:vm|vt)\.tiktok\.com\/)([\w\d]+)(?=\/?)/,
};
