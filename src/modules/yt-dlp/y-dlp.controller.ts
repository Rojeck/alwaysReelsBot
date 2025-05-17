import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  // Get,
  // Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { YtdlpService } from './yt-dlp.service';
// import { Request } from 'express';
// import { catchError, lastValueFrom, of } from 'rxjs';
// import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
// import { promises as fs } from 'fs';

// function filterFormats(formats) {
//   return formats.filter(
//     (format) => format.vcodec !== 'none' && format.acodec !== 'none',
//   );
// }

@Controller('ytdlp')
@UseGuards(AuthGuard('jwt'))
export class YtdlpController {
  constructor(
    private readonly ytdlpService: YtdlpService,
    private httpService: HttpService,
  ) {}

  @Post('download-check')
  async download(@Body() body: { url: string; props?: string[] }) {
    const { url } = body;

    if (!url) {
      throw new BadRequestException('Missing URL');
    }

    try {
      const props = [
        '-f',
        'best',
        '--print',
        '{"videoUrl": "%(url)s", "thumbnail": "%(thumbnail)s"}',
      ];
      const result = await this.ytdlpService.downloadVideo(url, props);
      // const parsed = JSON.parse(result);
      // const filtered = filterFormats(parsed.formats);
      // const bestVideoAudioFormat = filtered.find(
      //   (f) => f.format_id >= 22 && f.vcodec !== 'none' && f.acodec !== 'none',
      // );

      // if (!bestVideoAudioFormat) {
      //   const audioFormats = parsed.filter();
      // }

      // await fs.writeFile('video-info.json', result, 'utf8');
      return {
        message: 'Download started/completed',
        result,
      };
    } catch (error) {
      return {
        message: `failed by: ${error}`,
      };
    }
  }

  // @Get('check-ip')
  // async checkIp(@Req() req: Request) {
  //   const ip =
  //     (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
  //     req.socket.remoteAddress;

  //   console.log('ip', ip);
  //   return null;
  // }

  // @Post('send-check')
  // async sendCheck() {
  //   const response = (await lastValueFrom(
  //     this.httpService
  //       .request({
  //         url: 'https://40c6-84-239-42-137.ngrok-free.app/ytdlp/check-ip',
  //       })
  //       .pipe(
  //         catchError(() => {
  //           return of(null);
  //         }),
  //       ),
  //   )) as AxiosResponse;

  //   console.log(response?.data);

  //   return null;
  // }
}
