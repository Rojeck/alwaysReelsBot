import { VideoService } from './types';

export const defaultVideoInfo = {
  width: 1080,
  height: 1920,
  duration: 0,
};

export const servicesPatterns = {
  [VideoService.IG]:
    /^https:\/\/(?:www\.)?instagram\.com\/(?:[a-zA-Z0-9_-]+\/)?reels?\/([a-zA-Z0-9_-]+)\/?/,
  [VideoService.YT]:
    /^https:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)\/?/,
};
