export function isNotUndefined<T>(obj: T | undefined): obj is T {
    return obj !== undefined;
}

export function isArray<T>(value: T | any): value is T[] {
    return Array.isArray(value);
}

export function required<T>(value: T | undefined) {
    if (value === undefined) {
        throw new Error('Missing required environment variable');
    }
    return value;
}
