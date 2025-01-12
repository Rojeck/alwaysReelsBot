import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerOptions,
} from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { TgTextMessage } from '../../types';

@Injectable()
export class TgThrottlerGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    defLimit: number,
    defTTL: number,
    throttler: ThrottlerOptions,
  ): Promise<boolean> {
    const { limit, ttl } = this.reflector.get<{ limit: number; ttl: number }>(
      'throttle',
      context.getHandler(),
    ) || { limit: defLimit, ttl: defTTL };
    const data = context.switchToRpc().getData().update
      .message as TgTextMessage;

    const userId = String(data.from.id);
    const key = this.generateKey(context, userId, throttler.name);
    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      throw new ThrottlerException();
    }

    return true;
  }
}
