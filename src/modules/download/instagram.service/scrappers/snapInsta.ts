import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import { catchError, lastValueFrom, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import { checkVideoURL } from 'src/utils';
import { defaultVideoInfo } from 'src/constants';
import { InstaDownloaders, VideoInfo, VideoService } from 'src/types';

export const fetchFromSnapInsta = async (
  postId: string,
  httpService: HttpService,
): Promise<VideoInfo | null | string> => {
  const form = new FormData();
  form.append('t', 'media');
  form.append('lang', 'ru');
  form.append('q', `https://www.instagram.com/reels/${postId}`);

  const response = (await lastValueFrom(
    httpService
      .request({
        url: process.env.SNAP_INSTA_URL,
        method: 'POST',
        data: form,
      })
      .pipe(
        catchError(() => {
          return of(null);
        }),
      ),
  )) as AxiosResponse;

  if (!response.data.data) return null;

  const $ = load(response.data.data);
  const thumbnail = $('.download-items__thumb img').attr('src');
  const video_url = $('.download-items__btn a').attr('href');

  if (!video_url || !thumbnail) {
    return null;
  }

  const isVideoUrlValid = await checkVideoURL(video_url, httpService);

  if (!isVideoUrlValid) return null;

  return {
    url: video_url,
    width: defaultVideoInfo.width,
    height: defaultVideoInfo.height,
    thumbnail,
    duration: defaultVideoInfo.duration,
    service: VideoService.IG,
    downloadVia: InstaDownloaders.SNAPINSTA,
  };
};
