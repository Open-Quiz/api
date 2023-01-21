// Named functions that are run before all tests.
// See: https://vitest.dev/config/#globalsetup
import { Server } from 'http';
import createApp from '../app/createApp';
import prisma from '../client/instance';

let server: Server;

export function setup() {
    server = createApp().server;
}

export async function teardown() {
    server.close();

    await prisma.$disconnect();
}
