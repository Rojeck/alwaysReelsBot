import { Module } from '@nestjs/common';
import { YtdlpService } from './yt-dlp.service';
import { YtdlpController } from './y-dlp.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [YtdlpController],
  providers: [YtdlpService],
  exports: [YtdlpService],
})
export class YtdlpModule {}
