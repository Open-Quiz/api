import { UserData } from '@prisma/client';

export type UserDataWithoutId = Omit<UserData, 'userId'>;

export interface ProviderData {
    providerId: string;
    data: UserDataWithoutId;
}

export interface ServiceProvider {
    extractProviderData(token: string): Promise<ProviderData>;
}
