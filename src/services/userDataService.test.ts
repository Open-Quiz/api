import { describe, it, expect } from 'vitest';
import { UserDataWithoutId } from './providers/serviceProvider';
import { UserDataService } from './userDataService';

describe('@Integration - User Data Service', () => {
    describe('Is user data outdated', async () => {
        it('returns true if the original data is null', async () => {
            const newUserData: UserDataWithoutId = {
                username: 'Test 1',
                profilePicture: 'https://example.com/1.png',
            };

            const isOutdated = UserDataService.isUserDataOutdated(null, newUserData);

            expect(isOutdated).toBe(true);
        });
    });
});
