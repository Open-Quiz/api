class DTO<InstanceType> {
    private readonly instance: InstanceType;

    constructor(instance: InstanceType) {
        this.instance = instance;
    }

    public exclude<Key extends keyof InstanceType>(...keys: Key[]): DTO<Omit<InstanceType, Key>> {
        const newInstance = { ...this.instance };
        for (let key of keys) {
            delete newInstance[key];
        }
        return new DTO(newInstance);
    }

    //     public select<Key extends keyof InstanceType, ReturnType>(
    //         key: Key,
    //         callback: (dto: DTO<InstanceType[Key]>) => DTO<ReturnType>,
    //     ): DTO<Omit<InstanceType, Key> & { [key]: ReturnType }> {
    //         const newInstance = { ...this.instance, key: callback(new DTO(this.instance[key])) };

    //         return new DTO(newInstance);
    //     }
}
