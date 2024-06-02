import { HttpService } from '@nestjs/axios';
import { InstaDownloaders, VideoInfo } from 'src/types/instagram';
import * as FormData from 'form-data';
import { EMPTY, catchError, lastValueFrom, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import constants from 'src/constants';
import { checkVideoURL } from '../checkVideoUrl';

export const fetchFromSnapInsta = async (
  postId: string,
  httpService: HttpService,
): Promise<VideoInfo | null | string> => {
  const form = new FormData();
  form.append('t', 'media');
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
  const video_url = $(
    'a.abutton.is-success.is-fullwidth.btn-premium.mt-3',
  ).attr('href');
  const thumbnail = $('img').attr('src');

  if (!video_url || !thumbnail) {
    return null;
  }

  const isVideoUrlValid = await checkVideoURL(video_url, httpService);

  if (!isVideoUrlValid) return constants.errors.invalid_url;

  return {
    url: video_url,
    width: constants.defaultVideoInfo.width,
    height: constants.defaultVideoInfo.height,
    thumbnail,
    duration: constants.defaultVideoInfo.duration,
    downloadVia: InstaDownloaders.SNAPINSTA,
  };
};
