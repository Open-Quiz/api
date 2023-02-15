import { Constructor } from '../types/utility';
import BindThis from './bindThis';

export type ControllerMeta = {
    route: string;
};

export type ControllerMetaObj = {
    controllerMeta: ControllerMeta;
};

export default function Controller(route?: string) {
    return function (constructor: Constructor) {
        Object.assign(constructor, { controllerMeta: { route } });
    };
}
