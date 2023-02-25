export interface ServiceProvider {
    extractProviderId(token: string): Promise<string>;
}
