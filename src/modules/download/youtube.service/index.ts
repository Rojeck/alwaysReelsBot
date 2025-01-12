import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

import { VideoInfo, VideoService } from 'src/types';
import { getPostId, strToBoolean } from 'src/utils';
import { DownloadService } from '../download.service';
import { HttpService } from '@nestjs/axios';

// TEMPLATE

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
  }

  async fetchPost(postURL: string): Promise<VideoInfo | null> {
    const postId = getPostId(postURL, VideoService.YT);
    const cacheKey = `${VideoService.YT}:${postId}`;
    const result = null;
    return result;
  }
}
