import { Constructor } from '../types/utility';

export type ControllerMeta = {
    route: string;
};

const ControllerMetadataKey = Symbol('controller');

export function getControllerMeta(constructor: any): ControllerMeta | undefined {
    return Reflect.getOwnMetadata(ControllerMetadataKey, constructor);
}

export default function Controller(route?: string) {
    return function (constructor: Constructor) {
        Reflect.defineMetadata(ControllerMetadataKey, { route }, constructor);
    };
}
