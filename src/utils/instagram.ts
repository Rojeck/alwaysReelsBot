import { BadRequestException } from '@nestjs/common';
import { servicesPatterns } from 'src/constants';
import { VideoService } from 'src/types';

const reelsCheck = (url: string): RegExpMatchArray | null =>
  url.match(servicesPatterns[VideoService.IG]);

export function getPostId(postUrl: string) {
  let postId: string;
  const reelCheck = reelsCheck(postUrl);

  if (reelCheck) {
    postId = reelCheck.at(-1);
  }

  if (!postId) {
    throw new BadRequestException('Invalid post URL');
  }

  return postId;
}
