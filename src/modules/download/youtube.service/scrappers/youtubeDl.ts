import { VideoInfo, VideoService, YTDownloaders } from 'src/types';
import { youtubeDl } from 'youtube-dl-exec';

export async function fetchFromYoutubeDl(
  postId: string,
): Promise<VideoInfo | null> {
  const proxyUrl = process.env.PROXY_URL;
  const result = await youtubeDl(`https://www.youtube.com/shorts/${postId}`, {
    format: 'best',
    proxy: proxyUrl,
    dumpSingleJson: true,
    mergeOutputFormat: 'mp4',
    noWarnings: true,
    audioFormat: 'mp3',
    youtubeSkipDashManifest: true,
    referer: 'https://google.com',
  });

  if (!result) return null;

  return {
    url: (result as any).url,
    width: result.width,
    height: result.height,
    thumbnail: result.thumbnail,
    duration: result.duration,
    service: VideoService.YT,
    downloadVia: YTDownloaders.YoutubeDL,
  };
}
