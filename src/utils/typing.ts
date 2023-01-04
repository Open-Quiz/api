export function isNotUndefined<T>(obj: T | undefined): obj is T {
    return obj !== undefined;
}
