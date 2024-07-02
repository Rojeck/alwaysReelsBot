import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import {
  fetchFromSaveFrom,
  fetchFromSnapInsta,
  fetchFromGraphQL,
} from './scrappers';
import { VideoInfo, VideoService } from 'src/types';
import { getPostId, strToBoolean } from 'src/utils';
import { DownloadService } from '../download.service';

@Injectable()
export class InstagramService extends DownloadService {
  private igDisableSaveFrom: boolean;
  private igDisableSnapInsta: boolean;
  private igDisableGraphQL: boolean;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    super();
    this.igDisableSaveFrom = strToBoolean(
      this.config.get('IG_DISABLE_SAVE_FROM'),
    );
    this.igDisableSnapInsta = strToBoolean(
      this.config.get('IG_DISABLE_SNAP_INSTA'),
    );
    this.igDisableGraphQL = strToBoolean(this.config.get('IG_DISABLE_GRAPHQL'));
  }

  async fetchPost(postURL: string): Promise<VideoInfo | null> {
    const postId = getPostId(postURL);
    const cacheKey = `${VideoService.IG}:${postId}`;
    let result = null;

    const cachedData = await this.cacheManager.get<VideoInfo>(cacheKey);

    if (cachedData) return cachedData;

    if (!this.igDisableGraphQL) {
      result = await fetchFromGraphQL(postId, this.httpService);
    }

    if (!result && !this.igDisableSnapInsta) {
      result = await fetchFromSnapInsta(postId, this.httpService);
    }

    if (!result && !this.igDisableSaveFrom) {
      result = await fetchFromSaveFrom(postId, this.httpService);
    }

    if (result) {
      this.cacheManager.set(cacheKey, result);
    }

    return result;
  }
}
