export interface Chat {
  id: number;
  title: string;
  type: string;
  all_members_are_administrators: boolean;
}

export interface MessageFrom {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  language_code: string;
  is_premium: boolean;
}

export interface TgTextMessage {
  message_id: number;
  from: MessageFrom;
  chat: Chat;
  date: number;
  text: string;
}
