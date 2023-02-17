import { Express } from 'express';
import { RequestHandler, Router } from 'express';
import { hasControllerMeta } from '../../decorators/controller';
import { hasRouteMeta } from '../../decorators/route';
import { Method } from '../../types/enums/MethodTypes';

type Routes = Record<string, { method: Method; handler: RequestHandler }[]>;

function generateRouter(routes: Routes) {
    const router = Router();

    for (const routeUrl in routes) {
        const routeBuilder = router.route(routeUrl);

        for (const handlerMeta of routes[routeUrl]) {
            switch (handlerMeta.method) {
                case 'GET':
                    routeBuilder.get(handlerMeta.handler);
                    break;
                case 'POST':
                    routeBuilder.post(handlerMeta.handler);
                    break;
                case 'PATCH':
                    routeBuilder.patch(handlerMeta.handler);
                    break;
                case 'DELETE':
                    routeBuilder.delete(handlerMeta.handler);
                    break;
            }
        }
    }

    return router;
}

function generateRoutes(controller: object): Routes {
    const routes: Routes = {};

    const proto = controller.constructor.prototype;
    Object.getOwnPropertyNames(proto).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (descriptor && typeof descriptor.value === 'function' && hasRouteMeta(descriptor.value)) {
            const meta = descriptor.value.metadata.route;
            if (!(meta.route in routes)) {
                routes[meta.route] = [];
            }

            const handler = descriptor.value as unknown as RequestHandler;

            routes[meta.route].push({
                method: meta.method,
                handler: (req, res, next) => handler(req, res, next),
            });
        }
    });

    return routes;
}

export function useRoutes(app: Express, controller: Object) {
    if (!hasControllerMeta(controller.constructor)) {
        return;
    }

    const baseRoute = controller.constructor.metadata.controller.route;

    const routes = generateRoutes(controller);
    const router = generateRouter(routes);

    app.use(baseRoute, router);
}
