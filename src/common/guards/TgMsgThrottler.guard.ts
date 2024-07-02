import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerOptions,
} from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { TgTextMessage } from '../../types';
import { identifyVideoService } from 'src/utils';

@Injectable()
export class TgMsgThrottlerGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: ThrottlerOptions,
  ): Promise<boolean> {
    const data = context.switchToRpc().getData().update
      .message as TgTextMessage;

    if (!identifyVideoService(data.text)) {
      return true;
    }

    const userId = String(data.from.id);
    const key = this.generateKey(context, userId, throttler.name);
    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      throw new ThrottlerException();
    }

    return true;
  }
}
