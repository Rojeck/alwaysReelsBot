import { ConfigService } from '@nestjs/config';
import {
  TelegrafModuleAsyncOptions,
  TelegrafModuleOptions,
} from 'nestjs-telegraf';
import nullResMiddleware from '../../common/middlewares/nullRes.middleware';

const telegrafModuleOptions = (
  config: ConfigService,
): TelegrafModuleOptions => {
  return {
    token: config.get('TELEGRAM_TOKEN'),
    middlewares: [nullResMiddleware],
  };
};

export default (): TelegrafModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => telegrafModuleOptions(config),
  };
};
