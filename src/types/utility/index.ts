export type ObjectValues<T> = T[keyof T];

export type Constructor = { new (...args: any[]): any };

export type ArrayType<Type> = Type extends (infer Element)[] ? Element : never;
