import { describe, expect, it } from 'vitest';
import { required } from '../utility/typing';

describe('@Unit - Config', async () => {
    describe('Required', async () => {
        it('Returns the value if its not undefined', async () => {
            const res = required('Test');
            expect(res).toBe('Test');
        });

        it('Throws an error if the value is undefined', async () => {
            expect(() => required(undefined)).toThrowError();
        });
    });
});
