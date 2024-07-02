import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isBoolean,
  isString,
  IsString,
} from 'class-validator';

function IsArrayOrBoolean(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isArrayOrBoolean',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (isBoolean(value)) {
            return true;
          } else if (
            Array.isArray(value) &&
            value.every((item) => isString(item))
          ) {
            return true;
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an array of strings or a boolean true`;
        },
      },
    });
  };
}

export class MessageJobDto {
  @IsArrayOrBoolean({
    message: 'Users must be an array of strings or a boolean',
  })
  users: string[] | boolean;

  @IsArrayOrBoolean({
    message: 'Groups must be an array of strings or a boolean',
  })
  groups: string[] | boolean;

  @IsString()
  message: string;
}
