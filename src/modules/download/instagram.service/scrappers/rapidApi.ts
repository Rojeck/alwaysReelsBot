import { HttpService } from '@nestjs/axios';
import { InstaDownloaders, VideoInfo, VideoService } from 'src/types';
import { catchError, lastValueFrom, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { defaultVideoInfo } from 'src/constants';

export const fetchFromRapidAPI = async (
  postId: string,
  httpService: HttpService,
): Promise<VideoInfo | null> => {
  const response = (await lastValueFrom(
    httpService
      .request({
        url: `${process.env.RAPID_API_URL}?code_or_id_or_url=${postId}`,
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.RAPID_API_KEY,
          'x-rapidapi-host': process.env.RAPID_API_HOST,
        },
      })
      .pipe(
        catchError(() => {
          return of(null);
        }),
      ),
  )) as AxiosResponse;

  if (!response?.data) return null;

  const { thumbnail_url, video_url, video_duration } = response.data.data;

  return {
    url: video_url,
    width: defaultVideoInfo.width,
    height: defaultVideoInfo.height,
    thumbnail: thumbnail_url,
    service: VideoService.IG,
    duration: video_duration,
    downloadVia: InstaDownloaders.RAPID_API,
  } as VideoInfo;
};
