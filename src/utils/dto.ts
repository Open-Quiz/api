import { ArrayType, isArray } from './typing';

type ReplaceKeyType<InstanceType, Key extends keyof InstanceType, NewKeyType> = {
    [InstanceKey in keyof InstanceType]: InstanceKey extends Key ? NewKeyType : InstanceType[InstanceKey];
};

type ReplaceKeyArrayType<InstanceType, Key extends keyof InstanceType, NewKeyType> = {
    [InstanceKey in keyof InstanceType]: InstanceKey extends Key
        ? InstanceType[InstanceKey] extends any[]
            ? NewKeyType[]
            : NewKeyType
        : InstanceType[InstanceKey];
};

export default class DTO<InstanceType> {
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

    public map<ReturnType>(mapper: (instance: InstanceType) => ReturnType): DTO<ReturnType> {
        const newInstance = typeof this.instance === 'object' ? mapper({ ...this.instance }) : mapper(this.instance);
        return new DTO(newInstance);
    }

    public select<
        Key extends keyof InstanceType,
        ReturnType,
        ReturnInstanceType = ReplaceKeyType<InstanceType, Key, ReturnType>,
    >(key: Key, callback: (dto: DTO<InstanceType[Key]>) => DTO<ReturnType>): DTO<ReturnInstanceType> {
        const newKeyValue = callback(new DTO(this.instance[key])).instance;
        const newInstance = { ...this.instance, [key]: newKeyValue };

        return new DTO(newInstance as ReturnInstanceType);
    }

    public selectEach<
        Key extends keyof InstanceType,
        ReturnType,
        ReturnInstanceType = ReplaceKeyArrayType<InstanceType, Key, ReturnType>,
    >(key: Key, callback: (dto: DTO<ArrayType<InstanceType[Key]>>) => DTO<ReturnType>): DTO<ReturnInstanceType> {
        const keyValue = this.instance[key];
        if (!isArray<ArrayType<InstanceType[Key]>>(keyValue)) {
            throw new Error('selectEach can only be used on a parameter that is an array');
        }

        const newKeyValue = keyValue.map((value) => callback(new DTO(value)).instance);
        const newInstance = { ...this.instance, [key]: newKeyValue };

        return new DTO(newInstance as ReturnInstanceType);
    }

    public build(): InstanceType {
        return this.instance;
    }
}
