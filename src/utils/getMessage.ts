import messages from 'src/messages';

type Messages = typeof messages;

type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object
    ? `${string & K}` | `${string & K}.${NestedKeys<T[K]>}`
    : `${string & K}`;
}[keyof T];

type MessageValue = {
  [K in NestedKeys<Messages>]: any;
};

export function getMessage<T extends NestedKeys<Messages>>(
  path: T,
): MessageValue[T] {
  const keys = path.split('.');
  let value: any = messages;

  for (const key of keys) {
    if (value && key in value) {
      value = value[key];
    } else {
      throw new Error(`Message does not exist for path: ${path}`);
    }
  }

  return value;
}
