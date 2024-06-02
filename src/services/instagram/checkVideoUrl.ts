import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, of } from 'rxjs';
import { AxiosResponse } from 'axios';

export const checkVideoURL = async (
  videoURL: string,
  httpService: HttpService,
): Promise<boolean> => {
  const isValid = (await lastValueFrom(
    httpService
      .request({
        url: videoURL,
        method: 'GET',
        headers: {
          Range: 'bytes=0-0',
        },
      })
      .pipe(
        catchError(() => {
          return of(null);
        }),
      ),
  )) as AxiosResponse;

  return !!isValid;
};
