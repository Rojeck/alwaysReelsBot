import { BadRequestException } from '@nestjs/common';

const REEL_REGEX =
  /^https:\/\/(?:www\.)?instagram\.com\/reels?\/([a-zA-Z0-9_-]+)\/?/;

export const reelsCheck = (url: string): RegExpMatchArray | null =>
  url.match(REEL_REGEX);

export const getPostId = (postUrl: string) => {
  let postId: string;
  const reelCheck = reelsCheck(postUrl);

  if (reelCheck) {
    postId = reelCheck.at(-1);
  }

  if (!postId) {
    throw new BadRequestException('Invalid post URL');
  }

  return postId;
};
