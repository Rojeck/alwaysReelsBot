import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { YouTubeService } from './youtube.service';
import { TikTokService } from './tiktok.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.ig', '.env.yt', '.env.tt'],
      isGlobal: false,
    }),
  ],
  providers: [InstagramService, YouTubeService, TikTokService],
  exports: [InstagramService, YouTubeService, TikTokService],
})
export class DownloadModule {}
