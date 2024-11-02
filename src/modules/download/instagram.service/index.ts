import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { fetchFromPubler, fetchFromGraphQL } from './scrappers';
import { VideoInfo, VideoService } from 'src/types';
import { getPostId, strToBoolean } from 'src/utils';
import { DownloadService } from '../download.service';
import { fetchFromRapidAPI } from './scrappers/rapidApi';

@Injectable()
export class InstagramService extends DownloadService {
  private igDisablePubler: boolean;
  private igDisableGraphQL: boolean;
  private igDisableRapidAPI: boolean;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    super();
    this.igDisablePubler = strToBoolean(this.config.get('IG_DISABLE_PUBLER'));
    this.igDisableGraphQL = strToBoolean(this.config.get('IG_DISABLE_GRAPHQL'));
    this.igDisableRapidAPI = strToBoolean(
      this.config.get('IG_DISABLE_RAPID_API'),
    );
  }

  async fetchPost(postURL: string): Promise<VideoInfo | null> {
    const postId = getPostId(postURL, VideoService.IG);
    const cacheKey = `${VideoService.IG}:${postId}`;
    let result = null;

    const cachedData = await this.cacheManager.get<VideoInfo>(cacheKey);

    if (cachedData) return cachedData;

    if (!this.igDisableGraphQL) {
      result = await fetchFromGraphQL(postId, this.httpService);
    }

    if (!result && !this.igDisablePubler) {
      result = await fetchFromPubler(postId, this.httpService);
    }

    if (!result && !this.igDisableRapidAPI) {
      result = await fetchFromRapidAPI(postId, this.httpService);
    }

    if (result) {
      this.cacheManager.set(cacheKey, result);
    }

    return result;
  }
}
