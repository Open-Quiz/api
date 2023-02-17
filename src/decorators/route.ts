import { Method } from '../types/enums/Method';
import { attachMetadata, hasMeta, Metadata } from '../utility/metadata';

export type RouteMeta = {
    route: Meta;
};

type Meta = {
    method: Method;
    route: string;
};

export function hasRouteMeta(obj: any): obj is Metadata<RouteMeta> {
    return hasMeta(obj, 'route');
}

export function Get(route = '/') {
    return Route(Method.GET, route);
}

export function Put(route = '/') {
    return Route(Method.PUT, route);
}

export function Post(route = '/') {
    return Route(Method.POST, route);
}

export function Patch(route = '/') {
    return Route(Method.PATCH, route);
}

export function Delete(route = '/') {
    return Route(Method.DELETE, route);
}

export function Route(method: Method, route = '/') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const meta = { method, route };
        attachMetadata(descriptor.value, { route: meta });
    };
}
