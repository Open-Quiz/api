import { Express } from 'express';
import { RequestHandler, Router } from 'express';
import { hasControllerMeta } from '../../decorators/controller';
import { hasRouteMeta, RouteMeta } from '../../decorators/route';
import { catchErrorWrapper } from '../../middleware/errorHandler';
import { Method } from '../../types/enums/Method';
import { Metadata } from '../../utility/metadata';

type Routes = (RouteMeta['route'] & { handler: RequestHandler })[];

function isRequestHandler(handler: any): handler is RequestHandler & Metadata<RouteMeta> {
    return typeof handler === 'function' && hasRouteMeta(handler);
}

function generateRouter(routes: Routes) {
    const router = Router();

    for (const route of routes) {
        const args = [route.route, route.handler] as const;
        switch (route.method) {
            case Method.GET:
                router.get(...args);
                break;
            case Method.PUT:
                router.put(...args);
                break;
            case Method.POST:
                router.post(...args);
                break;
            case Method.PATCH:
                router.patch(...args);
                break;
            case Method.DELETE:
                router.delete(...args);
                break;
        }
    }

    return router;
}

function generateRoutes(controller: object): Routes {
    const routes: Routes = [];

    const proto = controller.constructor.prototype;
    Object.getOwnPropertyNames(proto).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (descriptor && isRequestHandler(descriptor.value)) {
            const handler = catchErrorWrapper(descriptor.value);
            const meta = descriptor.value.metadata.route;

            routes.push({ ...meta, handler });
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
