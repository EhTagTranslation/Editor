import { Opaque } from 'type-fest';
import { ValidationOptions, ValidationArguments, buildMessage, ValidateBy } from 'class-validator';

export type RawTag = Opaque<string, 'raw'>;

export function isRawTag(tag: unknown): tag is RawTag {
    if (typeof tag != 'string') return false;
    if (tag.length <= 1) return false;
    if (tag.startsWith(' ') || tag.endsWith(' ')) return false;
    if (!/^[-a-z0-9. ]+$/g.test(tag)) return false;
    return true;
}

export function IsRawTag(validationOptions?: ValidationOptions): PropertyDecorator {
    return ValidateBy(
        {
            name: isRawTag.name,
            validator: {
                validate(value: unknown, _args: ValidationArguments) {
                    return isRawTag(value);
                },
                defaultMessage: buildMessage((eachPrefix, args) => {
                    const tag = args?.value as unknown;
                    if (typeof tag != 'string') return `${eachPrefix}$property is not a string`;
                    if (tag.length <= 1) return `${eachPrefix}$property is too short.`;
                    if (tag.startsWith(' ') || tag.endsWith(' '))
                        return `${eachPrefix}$property starts with or end with white spaces.`;
                    if (!/^[-a-z0-9. ]$/g.test(tag))
                        return `${eachPrefix}$property included non-alphanumeric characters which are not permitted. Only hyphens, periods, and spaces are allowed in tags.`;
                    return `${eachPrefix}$property is not a valid tag.`;
                }, validationOptions),
            },
        },
        validationOptions,
    );
}
