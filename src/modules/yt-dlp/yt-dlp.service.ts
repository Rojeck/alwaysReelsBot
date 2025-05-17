import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import YTDlpWrap from 'yt-dlp-wrap';
import * as fs from 'fs';
import * as path from 'path';

import { YT_DLP_BINARY_PATH, YT_DLP_PLATFORM } from '../../constants';

@Injectable()
export class YtdlpService implements OnModuleInit {
  private readonly logger = new Logger(YtdlpService.name);
  private ytDlpWrap: YTDlpWrap;
  private readonly proxyUrl: string = process.env.PROXY_URL || '';

  async onModuleInit() {
    await this.ensureBinaryUpToDate();
    this.ytDlpWrap = new YTDlpWrap(YT_DLP_BINARY_PATH);
    this.logger.log('yt-dlp initialized');
  }

  private async ensureBinaryUpToDate() {
    try {
      this.logger.log('Fetching yt-dlp release info...');
      const releases = await YTDlpWrap.getGithubReleases(1, 1);
      const latestVersion = releases[0]?.tag_name;

      if (!latestVersion) {
        throw new Error('Cannot determine latest yt-dlp version');
      }

      const parentDir = path.dirname(YT_DLP_BINARY_PATH);

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
        this.logger.log(`Created directory: ${parentDir}`);
      }

      const binaryExists = fs.existsSync(`${YT_DLP_BINARY_PATH}`);
      let currentVersion = '';

      if (binaryExists) {
        const output = await new YTDlpWrap(YT_DLP_BINARY_PATH).execPromise([
          '--version',
        ]);
        currentVersion = output.trim();
      }
      if (!binaryExists || currentVersion !== latestVersion) {
        this.logger.log(`Downloading yt-dlp ${latestVersion}...`);
        await YTDlpWrap.downloadFromGithub(
          YT_DLP_BINARY_PATH,
          latestVersion,
          YT_DLP_PLATFORM,
        );
        fs.chmodSync(YT_DLP_BINARY_PATH, 0o755);
        this.logger.log('yt-dlp binary downloaded and set executable');
      } else {
        this.logger.log(`yt-dlp is up to date: ${currentVersion}`);
      }
    } catch (err) {
      this.logger.error('Failed to check/update yt-dlp binary', err);
    }
  }

  async downloadVideo(url: string, props: string[]): Promise<any> {
    return this.ytDlpWrap.execPromise([
      url,
      '--no-warnings',
      '--no-playlist',
      '--no-check-certificate',
      '--no-call-home',
      '--skip-download',
      '--proxy',
      this.proxyUrl,
      ...props,
    ]);
  }
}
