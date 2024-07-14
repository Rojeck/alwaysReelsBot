import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

import { VideoInfo, VideoService } from 'src/types';
import { getPostId, strToBoolean } from 'src/utils';
import { DownloadService } from '../download.service';
import { fetchFromYoutubeDl } from './scrappers';

@Injectable()
export class YouTubeService extends DownloadService {
  private ytDisableYouTubeDl: boolean;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private config: ConfigService,
  ) {
    super();
    this.ytDisableYouTubeDl = strToBoolean(
      this.config.get('YT_DISABLE_YOUTUBEDL'),
    );
  }

  async fetchPost(postURL: string): Promise<VideoInfo | null> {
    const postId = getPostId(postURL, VideoService.YT);
    const cacheKey = `${VideoService.YT}:${postId}`;
    let result = null;

    const cachedData = await this.cacheManager.get<VideoInfo>(cacheKey);

    if (cachedData) return cachedData;

    if (!this.ytDisableYouTubeDl) {
      result = await fetchFromYoutubeDl(postId);
    }

    if (result) {
      this.cacheManager.set(cacheKey, result);
    }

    return result;
  }
}
