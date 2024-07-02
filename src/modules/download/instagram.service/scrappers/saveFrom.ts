import { HttpService } from '@nestjs/axios';
import { InstaDownloaders, VideoInfo, VideoService } from 'src/types';
import { catchError, lastValueFrom, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { defaultVideoInfo } from 'src/constants';

export const fetchFromSaveFrom = async (
  postId: string,
  httpService: HttpService,
): Promise<VideoInfo | null> => {
  const response = (await lastValueFrom(
    httpService
      .request({
        url: process.env.SAVE_FROM_URL,
        method: 'POST',
        headers: {
          'x-rapidapi-key': process.env.SAVE_FROM_KEY,
          'x-rapidapi-host': process.env.SAVE_FROM_HOST,
        },
        data: {
          url: `https://www.instagram.com/reels/${postId}`,
        },
      })
      .pipe(
        catchError(() => {
          return of(null);
        }),
      ),
  )) as AxiosResponse;

  if (!response?.data) return null;

  const data = response.data[0];
  const videoLink = data.urls[0].url;
  const thumbnail = data.pictureUrl;

  return {
    url: videoLink,
    width: defaultVideoInfo.width,
    height: defaultVideoInfo.height,
    thumbnail,
    service: VideoService.IG,
    duration: defaultVideoInfo.duration,
    downloadVia: InstaDownloaders.SAVEFROM,
  };
};
