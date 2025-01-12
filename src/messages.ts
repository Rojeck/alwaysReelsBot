import { Chat, MessageFrom } from './types';

export default {
  start: `<b>Бот для парсингу Instagram Reels</b>\n
  Надішліть посилання на Instagram Reels, який ви хочете завантажити, і бот відповість вам цим відео у форматі MP4.\n
  Ви можете додати бота до вашої телеграм-групи. Якщо хтось у групі надішле посилання на Instagram Reels, бот відповість відповідним відео.`,
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
