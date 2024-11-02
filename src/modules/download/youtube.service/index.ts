import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

import { VideoInfo, VideoService } from 'src/types';
import { getPostId, strToBoolean } from 'src/utils';
import { DownloadService } from '../download.service';
import { fetchFromHighPerform, fetchFromYoutubeDl } from './scrappers';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class YouTubeService extends DownloadService {
  private ytDisableYouTubeDl: boolean;
  private ytDisableHighPerform: boolean;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private config: ConfigService,
    private httpService: HttpService,
  ) {
    super();
    this.ytDisableYouTubeDl = strToBoolean(
      this.config.get('YT_DISABLE_YOUTUBEDL'),
    );
    this.ytDisableHighPerform = strToBoolean(
      this.config.get('YT_DISABLE_HIGH_PERFORM'),
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

    if (!this.ytDisableHighPerform) {
      result = await fetchFromHighPerform(postId, this.httpService);
    }

    if (result) {
      this.cacheManager.set(cacheKey, result);
    }

    return result;
  }
}
