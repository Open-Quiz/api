import { Express } from 'express';
import { RequestHandler, Router } from 'express';
import { getControllerMeta } from '../decorators/controller';
import { getRouteMeta, RouteMeta } from '../decorators/route';
import { deleteMiddlewareMeta, getMiddlewareMeta } from '../decorators/use';
import { catchErrorWrapper } from '../middleware/errorHandler';
import { Method } from '../types/enums/Method';

type Routes = (RouteMeta & { handlers: RequestHandler[] })[];

interface UseRouteOptions {
    baseRoute?: string;
    controllers: Object[];
}

function isRequestHandler(handler: any): handler is RequestHandler {
    return typeof handler === 'function'; // && hasRouteMeta(handler);
}

function generateRouter(routes: Routes): Router {
    const router = Router();

    for (const route of routes) {
        const args = [route.route, ...route.handlers] as const;
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
    const controllerMiddleware = getMiddlewareMeta(controller);
    const routes: Routes = [];

    // Remove unnecessary metadata
    deleteMiddlewareMeta(controller);

    const proto = controller.constructor.prototype;
    Object.getOwnPropertyNames(proto).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (descriptor) {
            const meta = getRouteMeta(descriptor.value);

            if (meta && isRequestHandler(descriptor.value)) {
                const handlerMiddleware = getMiddlewareMeta(descriptor.value);
                const handler = catchErrorWrapper(descriptor.value.bind(controller));

                // Remove unnecessary metadata
                deleteMiddlewareMeta(descriptor.value);

                routes.push({ ...meta, handlers: [...controllerMiddleware, ...handlerMiddleware, handler] });
            }
        }
    });

    return routes;
}

export function useRoutes(app: Express, options: UseRouteOptions): void {
    const baseRoute = options.baseRoute ?? '';
    for (const controller of options.controllers) {
        const controllerMeta = getControllerMeta(controller.constructor);
        if (!controllerMeta) {
            return;
        }

        const routes = generateRoutes(controller);
        const router = generateRouter(routes);

        app.use(baseRoute + controllerMeta.route, router);
    }
}
