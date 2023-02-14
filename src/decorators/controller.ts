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
        const result = BindThis(constructor);
        Object.assign(result, { controllerMeta: { route } });

        console.log(result);
        return result;
    };
}
