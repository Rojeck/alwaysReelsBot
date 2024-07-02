export interface Chat {
  id: number;
  title: string;
  type: string;
  all_members_are_administrators: boolean;
}

export interface TgDocument {
  name: string;
  buffer: Buffer;
}

export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

export interface MessageFrom extends User {
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

export interface TgAction {
  id: string;
  from: MessageFrom;
  message: TgTextMessage;
  data: string;
}

export enum ChatMemberStatus {
  LEFT = 'left',
  KICKED = 'kicked',
  MEMBER = 'member',
}

export interface ChatMember {
  user: User;
  status: ChatMemberStatus;
}

export interface ChatMemberUpdate {
  chat: Chat;
  from: MessageFrom;
  old_chat_member: ChatMember;
  new_chat_member: ChatMember;
}
