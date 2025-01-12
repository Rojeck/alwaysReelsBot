import { SetMetadata } from '@nestjs/common';

export const Throttle = (limit: number, ttl: number) =>
  SetMetadata('throttle', { limit, ttl });
