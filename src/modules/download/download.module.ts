import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { YouTubeService } from './youtube.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env.ig',
      isGlobal: false,
    }),
  ],
  providers: [InstagramService, YouTubeService],
  exports: [InstagramService, YouTubeService],
})
export class DownloadModule {}
