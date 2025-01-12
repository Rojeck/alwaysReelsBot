import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import { catchError, lastValueFrom, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import { checkVideoURL } from 'src/utils';
import { defaultVideoInfo } from 'src/constants';
import { VideoInfo, VideoService } from 'src/types';
import { TikTokDownloaders } from 'src/types/tiktok';

export const fetchFromTikVideo = async (
  url: string,
  httpService: HttpService,
): Promise<VideoInfo | null> => {
  const form = new FormData();
  form.append('lang', 'ru');
  form.append('q', url);

  const response = (await lastValueFrom(
    httpService
      .request({
        url: process.env.TIK_VIDEO_URL,
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
  const thumbnail = $('.thumbnail .image-tik img').attr('src');

  let video_url;
  $('.tik-right .dl-action a').each((index, element) => {
    const href = $(element).attr('href');
    if (video_url) {
      return;
    }
    if (href.includes('mp4')) {
      video_url = href;
    }
  });

  if (!video_url) {
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
    service: VideoService.TT,
    downloadVia: TikTokDownloaders.TIK_VIDEO,
  };
};
