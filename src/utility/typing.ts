export function isNotUndefined<T>(obj: T | undefined): obj is T {
    return obj !== undefined;
}

export function isArray<T>(value: T | any): value is T[] {
    return Array.isArray(value);
}

export type ArrayType<Type> = Type extends (infer Element)[] ? Element : never;

export function hasMeta<T>(obj: any | T, metaKey: keyof T): obj is T {
    return Object.prototype.hasOwnProperty.call(obj, metaKey);
}
