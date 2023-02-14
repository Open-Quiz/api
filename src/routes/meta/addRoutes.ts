import { Express } from 'express';
import { RequestHandler, Router } from 'express';
import { ControllerMetaObj } from '../../decorators/controller';
import { RouteMeta, RouteMetaObj } from '../../decorators/route';
import { Method } from '../../types/enums/MethodTypes';
import { hasMeta } from '../../utility/typing';

type Routes = Record<string, { method: Method; handler: RequestHandler }[]>;

function generateRouter(routes: Routes) {
    const router = Router();

    for (const routeUrl in routes) {
        const routeBuilder = router.route(routeUrl);

        for (const handlerMeta of routes[routeUrl]) {
            switch (handlerMeta.method) {
                case 'GET':
                    routeBuilder.get(handlerMeta.handler);
                case 'POST':
                    routeBuilder.post(handlerMeta.handler);
                case 'PATCH':
                    routeBuilder.patch(handlerMeta.handler);
                case 'DELETE':
                    routeBuilder.delete(handlerMeta.handler);
            }
        }
    }

    return router;
}

function generateRoutes(obj: Object): Routes {
    const routes: Routes = {};

    const proto = obj.constructor.prototype;
    Object.getOwnPropertyNames(proto).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (
            descriptor &&
            typeof descriptor.value === 'function' &&
            hasMeta<RouteMetaObj>(descriptor.value, 'routeMeta')
        ) {
            const meta = descriptor.value.routeMeta;
            if (!(meta.route in routes)) {
                routes[meta.route] = [];
            }

            routes[meta.route].push({
                method: meta.method,
                handler: descriptor.value as unknown as RequestHandler,
            });
        }
    });

    return routes;
}

export function useRoutes(app: Express, obj: Object) {
    if (!hasMeta<ControllerMetaObj>(obj.constructor, 'controllerMeta')) {
        return;
    }

    const baseRoute = obj.constructor.controllerMeta.route;

    const routes = generateRoutes(obj);
    const router = generateRouter(routes);

    app.use(baseRoute, router);
}
