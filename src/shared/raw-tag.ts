import type { Opaque } from 'type-fest';
import { type ValidationOptions, type ValidationArguments, buildMessage, ValidateBy } from 'class-validator';

/** 表示一个标签的原文，不包含命名空间 */
export type RawTag = Opaque<string, 'raw'>;

/** 检查输入是否为一个标签的原文，不包含命名空间 */
export function isRawTag(tag: unknown): tag is RawTag {
    if (typeof tag != 'string') return false;
    if (tag.length < 1) return false;
    if (tag.startsWith(' ') || tag.endsWith(' ')) return false;
    if (!/^[-a-z0-9. ]+$/g.test(tag)) return false;
    return true;
}

/** 表示一个标签的原文，不包含命名空间 */
export function RawTag(tag: string | undefined): RawTag | undefined {
    if (!tag) return undefined;
    tag = tag.trim().toLowerCase();
    if (isRawTag(tag)) return tag;
    return undefined;
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
                    if (tag.length < 1) return `${eachPrefix}$property is too short.`;
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
