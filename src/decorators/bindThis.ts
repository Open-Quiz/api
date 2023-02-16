import { Constructor } from '../types/utility';
import { attachMetadata, hasMetadata } from '../utility/metadata';

// Modified from: https://stackoverflow.com/q/49910712/12643981
export default function BindThis<T extends Constructor>(constructor: T): T {
    let self: any;
    const Locker = class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            self = this;
        }
    };

    const proto = constructor.prototype;

    Object.getOwnPropertyNames(proto).forEach((key) => {
        if (key === 'constructor') {
            return;
        }
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (descriptor && typeof descriptor.value === 'function') {
            const original = descriptor.value;

            const boundFunction = (...args: any[]) => original.apply(self, args);

            if (hasMetadata(original)) {
                attachMetadata(boundFunction, original.metadata);
            }

            Locker.prototype[key] = boundFunction;
        }
    });
    return Locker;
}
