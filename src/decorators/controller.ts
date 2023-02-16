import { Constructor } from '../types/utility';
import { attachMetadata, hasMeta, Metadata } from '../utility/metadata';
import BindThis from './bindThis';

export type ControllerMeta = {
    route: string;
};

export function hasControllerMeta(obj: any): obj is Metadata<{ controller: ControllerMeta }> {
    return hasMeta(obj, 'controller');
}

export default function Controller(route?: string) {
    return function (constructor: Constructor) {
        const boundedThis = BindThis(constructor);
        attachMetadata(boundedThis, { controller: { route } });
        return boundedThis;
    };
}
