import { BadRequestException, Injectable } from '@nestjs/common';
import { fetchFromGraphQL } from './scrappers/graphql';
import { HttpService } from '@nestjs/axios';
import { getPostId } from '../../utils/instagram';
import { fetchFromSnapInsta } from './scrappers/snapInsta';
import { fetchFromSaveFrom } from './scrappers/saveFrom';
import constants from '../../constants';
import { VideoInfo } from 'src/types/instagram';

@Injectable()
export class InstagramService {
  constructor(private httpService: HttpService) {}

  async fetchPostJSON(postURL: string): Promise<VideoInfo> {
    const postId = getPostId(postURL);
    let result = null;

    result = await fetchFromGraphQL(postId, this.httpService);

    if (!result) {
      result = await fetchFromSnapInsta(postId, this.httpService);
    }

    if (result === constants.errors.invalid_url) {
      result = await fetchFromSaveFrom(postId, this.httpService);
    }

    if (result) return result;

    throw new BadRequestException(
      `Video link for this post is not available: ${postURL}`,
    );
  }
}
