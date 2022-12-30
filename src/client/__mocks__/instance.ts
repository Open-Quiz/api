import { PrismaClient } from '@prisma/client';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

beforeEach(() => {
    mockReset(mockPrisma);
});

const mockPrisma = mockDeep<PrismaClient>();
export default mockPrisma;
