import { Method } from '../types/enums/MethodTypes';

export type RouteMeta = {
    method: Method;
    route: string;
};

export type RouteMetaObj = {
    routeMeta: RouteMeta;
};

export function Get(route = '/') {
    return Route(Method.GET, route);
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
        descriptor.value.routeMeta = meta;
    };
}
