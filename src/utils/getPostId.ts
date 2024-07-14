import { BadRequestException } from '@nestjs/common';
import { servicesPatterns } from 'src/constants';
import { VideoService } from 'src/types';

const urlCheck = (
  url: string,
  service: VideoService,
): RegExpMatchArray | null => url.match(servicesPatterns[service]);

export function getPostId(postUrl: string, service: VideoService) {
  let postId: string;
  const reelCheck = urlCheck(postUrl, service);

  if (reelCheck) {
    postId = reelCheck.at(-1);
  }

  if (!postId) {
    throw new BadRequestException('Invalid post URL');
  }

  return postId;
}
