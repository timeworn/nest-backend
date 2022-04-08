import { ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';

export function MustMatch(pattern: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'MustMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [pattern],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [pattern] = args.constraints;
          const rg = RegExp(pattern);
          return rg.test(value);
        },
      },
    });
  };
}
