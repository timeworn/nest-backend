import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsOdd(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOdd',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          console.log({ value });
          return typeof Number(value) === 'number' && Number(value) % 2 == 1; // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
