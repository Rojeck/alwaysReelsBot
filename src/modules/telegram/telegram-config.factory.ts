import { ConfigService } from '@nestjs/config';
import {
  TelegrafModuleAsyncOptions,
  TelegrafModuleOptions,
} from 'nestjs-telegraf';
import { nullResMiddleware } from 'src/common/middlewares';

const telegrafModuleOptions = (
  config: ConfigService,
): TelegrafModuleOptions => {
  return {
    token: config.get('TELEGRAM_TOKEN'),
    middlewares: [nullResMiddleware],
  };
};

export const options = (): TelegrafModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => telegrafModuleOptions(config),
  };
};
