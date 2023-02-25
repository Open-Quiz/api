import { UserData } from '@prisma/client';

export interface ProviderData {
    providerId: string;
    data: Omit<UserData, 'userId'>;
}

export interface ServiceProvider {
    extractProviderData(token: string): Promise<ProviderData>;
}
