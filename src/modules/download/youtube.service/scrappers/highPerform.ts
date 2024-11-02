import { catchError, lastValueFrom, of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

import { defaultVideoInfo } from 'src/constants';
import { VideoInfo, VideoService, YTDownloaders } from 'src/types';

const headers = {
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Accept-Language': 'en,uk;q=0.9,ru-RU;q=0.8,ru;q=0.7,en-US;q=0.6',
  'Content-Type': 'application/json',
  Cookie:
    '_ga=GA1.1.556754060.1721511790; _clck=1qmk227%7C2%7Cfnm%7C0%7C1662; hp_ft=fef15e2b-9cf0-4d8d-92b1-5c6511bb9c03; _ga_G8871EJ2PR=GS1.1.1721511789.1.1.1721512523.0.0.0; _clsk=f3kbq6%7C1721513379470%7C5%7C1%7Cq.clarity.ms%2Fcollect',
  Origin: 'https://tools.highperformr.ai',
  Referer:
    'https://tools.highperformr.ai/youtube-video-downloader?url=https%3A%2F%2Fwww.youtube.com%2Fshorts%2FeiKahWBu3mw',
  'Sec-Ch-Ua':
    '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"macOS"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
};

export async function fetchFromHighPerform(
  postId: string,
  httpService: HttpService,
): Promise<VideoInfo | null> {
  const { data } = (await lastValueFrom(
    httpService
      .request({
        url: process.env.HIGH_PERFORM_URL,
        method: 'POST',
        headers,
        data: {
          platFormType: 'youtube_video_downloader',
          url: `https://www.youtube.com/shorts/${postId}`,
        },
      })
      .pipe(
        catchError((e) => {
          console.log(e);
          return of(null);
        }),
      ),
  )) as AxiosResponse;

  return {
    url: data.video_url,
    width: defaultVideoInfo.width,
    height: defaultVideoInfo.height,
    duration: defaultVideoInfo.duration,
    service: VideoService.YT,
    useStream: true,
    downloadVia: YTDownloaders.HighPerform,
  };
}
