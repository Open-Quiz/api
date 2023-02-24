import { Method } from '../types/enums/Method';

export type RouteMeta = {
    method: Method;
    route: string;
};

const RouteMetadataKey = Symbol('route');

export function getRouteMeta(target: any): RouteMeta | undefined {
    return Reflect.getOwnMetadata(RouteMetadataKey, target);
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
        Reflect.defineMetadata(RouteMetadataKey, meta, descriptor.value);
    };
}
