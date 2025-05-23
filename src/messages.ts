import { Chat, MessageFrom } from './types';

const donateJar = 'https://send.monobank.ua/jar/8nsQPpKRV3';

export default {
  start: `<b>Бот для завантаження Instagram Reels або TikTok</b>\n
  Надішліть посилання на reels/tiktok, який ви хочете завантажити, і бот відповість вам цим відео у форматі MP4.\n
  Ви можете додати бота до вашої телеграм-групи. Якщо хтось у групі надішле посилання на reels або tiktok, бот відповість відповідним відео.\n
  Проект працює виключно на благодійних донатах, які ви можете зробити на моно-банку: <a href="${donateJar}">посилання (тиць)</a>`,
  startBtn: 'Додати до групи',
  footerPrivate: 'Без стиснення',
  footerPublic: (name: string, link: string) =>
    `<b>Від:</b> @${name}  \n<b>Оригінал</b>: <a href="${link}">посилання</a>`,
  startNotiffication: (
    firstName: string,
    userName: string,
  ) => `NOTIFICATION: Хтось натиснув '/start'.
    Name: ${firstName}, 
    Tag: ${userName}`,
  jobs: {
    messages: {
      start: `Job 'Messages' started`,
      finish: (
        time: number,
        successful: number,
        failure: number,
      ) => `Job 'messages' finished. 
      Time elapsed: ${time} s.
      Successful messages: ${successful}.
      Failed messages: ${failure}.`,
      approveBtn: `Підтвердити`,
      cancelBtn: 'Відміна',
      ownerError: 'Помилка: тільки власник може запустити Action',
      emptyDataError:
        'Помилка: відсутні дані. Ви повинні підтвердити операцію протягом 1 хвилини!',
    },
  },
  changeService: {
    message:
      'Налаштуйте сервіси для вашої групи. Право налаштування мають тільки адміністратори',
    forbidden:
      'Помилка: Тільки адміністратори мають право викликати цю команду',
  },
  videoError:
    'Упс.. Це відео недоступне! 🥺 \nПеревірте посилання та спробуйте ще раз',
  errorNotification: (
    chat: Chat,
    from: MessageFrom,
    text: string,
    exception: any,
  ) => `ERROR: telegram error, exception: ${exception},
  <b>HostInfo</b>: 
  userName - ${from.first_name}, 
  userTag ${from.username},
  userId: ${from.id}, 
  chatName: ${chat.title}, 
  chatId: ${chat.id},
  chatType: ${chat.type},
  messageText: ${text}`,
} as const;
