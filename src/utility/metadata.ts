export type Metadata<T> = { metadata: T };

export function attachMetadata(obj: object, metadata: object) {
    if (hasMetadata(obj)) {
        Object.assign(obj.metadata, metadata);
    } else {
        Object.assign(obj, { metadata });
    }
}

export function hasMetadata(obj: any): obj is { metadata: object } {
    return Object.prototype.hasOwnProperty.call(obj, 'metadata');
}

export function hasMeta(obj: any, key: string) {
    return hasMetadata(obj) && Object.prototype.hasOwnProperty.call(obj.metadata, key);
}
