import { servicesPatterns } from 'src/constants';
import { VideoService } from 'src/types';

export function identifyVideoService(url: string): VideoService | null {
  if (!url.startsWith('https://')) {
    return null;
  }

  for (const [service, pattern] of Object.entries(servicesPatterns)) {
    if (pattern.test(url)) {
      return service as VideoService;
    }
  }

  return null;
}
