import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env.ig',
      isGlobal: false,
    }),
  ],
  providers: [InstagramService],
  exports: [InstagramService],
})
export class DownloadModule {}
