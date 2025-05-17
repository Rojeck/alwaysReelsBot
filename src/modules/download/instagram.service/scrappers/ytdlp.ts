import { defaultVideoInfo } from 'src/constants';
import { InstaDownloaders, VideoInfo, VideoService } from 'src/types';
import { YtdlpService } from 'src/modules/yt-dlp/yt-dlp.service';

export const fetchFromYtdlp = async (
  url: string,
  ytdlpService: YtdlpService,
): Promise<VideoInfo | string | null> => {
  const res = await ytdlpService
    .downloadVideo(url, [
      '-f',
      'best',
      '--print',
      '{"videoUrl": "%(url)s", "thumbnail": "%(thumbnail)s"}',
    ])
    .catch(() => {
      return null;
    });

  if (!res) {
    return null;
  }

  const data = JSON.parse(res);

  if (!data || !data.videoUrl || !data.thumbnail) {
    return null;
  }

  return {
    url: data.videoUrl,
    width: defaultVideoInfo.width,
    height: defaultVideoInfo.height,
    thumbnail: data.thumbnail,
    duration: defaultVideoInfo.duration,
    service: VideoService.IG,
    downloadVia: InstaDownloaders.YTDLP,
  };
};
