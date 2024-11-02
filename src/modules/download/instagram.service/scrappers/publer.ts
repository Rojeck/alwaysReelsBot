import { HttpService } from '@nestjs/axios';
import { InstaDownloaders, VideoInfo, VideoService } from 'src/types';
import { catchError, lastValueFrom, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { defaultVideoInfo } from 'src/constants';

const MAX_ATTEMPTS = 15;
const TIMEOUT = 300;

enum JobStatus {
  pending = 'working',
  complete = 'complete',
}

const headers = {
  accept: '*/*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'en,uk;q=0.9,ru-RU;q=0.8,ru;q=0.7,en-US;q=0.6',
  'content-type': 'application/json',
  origin: 'https://publer.io',
  referer: 'https://publer.io/',
  'sec-ch-ua':
    '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent':
    'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  priority: 'u=1, i',
};

export const fetchFromPubler = async (
  postId: string,
  httpService: HttpService,
): Promise<VideoInfo | null> => {
  const response = (await lastValueFrom(
    httpService
      .request({
        url: `${process.env.PUBLER_API_URL}/hooks/media`,
        method: 'POST',
        data: {
          url: `https://www.instagram.com/reels/${postId}`,
        },
        headers,
      })
      .pipe(
        catchError(() => {
          return of(null);
        }),
      ),
  )) as AxiosResponse;

  if (!response?.data) return null;

  const jobId = response.data.job_id;
  let path = null;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));

    const statusResponse = (await lastValueFrom(
      httpService
        .request({
          url: `${process.env.PUBLER_API_URL}/api/v1/job_status/${jobId}`,
          method: 'GET',
        })
        .pipe(
          catchError(() => {
            return of(null);
          }),
        ),
    )) as AxiosResponse;

    if (statusResponse?.data?.status === JobStatus.pending) {
      attempt++;
      continue;
    }

    if (statusResponse?.data?.status === JobStatus.complete) {
      path = statusResponse.data.payload?.[0]?.path;
    }

    break;
  }

  if (!path) return null;

  return {
    url: path,
    width: defaultVideoInfo.width,
    height: defaultVideoInfo.height,
    service: VideoService.IG,
    duration: defaultVideoInfo.duration,
    downloadVia: InstaDownloaders.PUBLER,
  };
};
