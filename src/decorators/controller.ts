import { Constructor } from '../types/utility';
import { attachMetadata, hasMeta, Metadata } from '../utility/metadata';

export type ControllerMeta = {
    route: string;
};

export function hasControllerMeta(obj: any): obj is Metadata<{ controller: ControllerMeta }> {
    return hasMeta(obj, 'controller');
}

export default function Controller(route?: string) {
    return function (constructor: Constructor) {
        attachMetadata(constructor, { controller: { route } });
    };
}
