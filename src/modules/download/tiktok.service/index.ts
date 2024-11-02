import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

import { VideoInfo, VideoService } from 'src/types';
import { strToBoolean } from 'src/utils';
import { DownloadService } from '../download.service';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { fetchFromTtSave } from './scrappers/ttsave';
import { fetchFromTikVideo } from './scrappers/tikvideo';

@Injectable()
export class TikTokService extends DownloadService {
  ttDisableTikVideo: boolean;
  ttDisableTtSave: boolean;
  ttDisableWmr: boolean;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private config: ConfigService,
    private httpService: HttpService,
  ) {
    super();
    this.ttDisableTikVideo = strToBoolean(
      this.config.get('TT_DISABLE_TIK_VIDEO'),
    );
    this.ttDisableTtSave = strToBoolean(this.config.get('TT_DISABLE_TT_SAVE'));
    this.ttDisableWmr = strToBoolean(this.config.get('TT_DISABLE_WMR'));
  }

  async fetchPost(postURL: string): Promise<VideoInfo | null> {
    const cacheKey = `${VideoService.TT}:${postURL}`;
    let result = null;

    const cachedData = await this.cacheManager.get<VideoInfo>(cacheKey);

    if (cachedData) return cachedData;

    if (!this.ttDisableTikVideo) {
      result = await fetchFromTikVideo(postURL, this.httpService);
    }

    if (!result && !this.ttDisableTtSave) {
      result = await fetchFromTtSave(postURL, this.httpService);
    }

    if (result) {
      this.cacheManager.set(cacheKey, result);
    }

    return result;
  }
}
