import { Injectable } from '@nestjs/common';
import { VideoInfo } from 'src/types';

@Injectable()
export abstract class DownloadService {
  abstract fetchPost(postURL: string): Promise<VideoInfo | null>;
}
