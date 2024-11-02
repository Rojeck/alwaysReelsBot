import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import { checkVideoURL } from 'src/utils';
import { defaultVideoInfo } from 'src/constants';
import { VideoInfo, VideoService } from 'src/types';
import { TikTokDownloaders } from 'src/types/tiktok';

export const fetchFromTtSave = async (
  url: string,
  httpService: HttpService,
): Promise<VideoInfo | null> => {
  const response = (await lastValueFrom(
    httpService
      .request({
        url: process.env.TT_SAVE_URL,
        method: 'POST',
        data: {
          language_id: '1',
          query: url,
        },
      })
      .pipe(
        catchError(() => {
          return of(null);
        }),
      ),
  )) as AxiosResponse;

  if (!response.data) return null;

  const $ = load(response.data);
  const downloadReadyBlock = $('#button-download-ready');
  const links = downloadReadyBlock.find('a');
  const video_url = links.first().attr('href');
  const thumbnail = links.last().attr('href');

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
    downloadVia: TikTokDownloaders.TT_SAVE,
  };
};
