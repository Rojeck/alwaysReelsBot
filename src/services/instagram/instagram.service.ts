import { BadRequestException, Injectable } from '@nestjs/common';
import { fetchFromGraphQL } from './scrappers/graphql';
import { HttpService } from '@nestjs/axios';
import { getPostId } from '../../utils/instagram';

@Injectable()
export class InstagramService {
  constructor(private httpService: HttpService) {}

  async fetchPostJSON(postURL: string) {
    const postId = getPostId(postURL);

    const apiJson = await fetchFromGraphQL(postId, this.httpService);
    if (apiJson) return apiJson;

    throw new BadRequestException(
      `Video link for this post is not available: ${postURL}`,
    );
  }
}
