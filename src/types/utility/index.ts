export type ObjectValues<T> = T[keyof T];

export type Constructor = { new (...args: any[]): any };
