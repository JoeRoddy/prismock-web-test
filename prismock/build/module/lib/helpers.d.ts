import { Item } from './delegate';
export declare function camelize(str: string): string;
export declare function shallowCompare(a: Item, b: Item): boolean;
export declare function pick(obj: Record<string, unknown>, keys: string[]): {};
export declare function omit(obj: Record<string, unknown>, keys: string[]): {};
export declare function uuid(): string;
export declare function removeUndefined(o?: Record<string, unknown>): Item | undefined;
export declare function pipe<T>(...functions: Array<(arg: T) => T>): (value: T) => T;
export declare function compose<T>(...functions: Array<(arg: T) => T>): (value: T) => T;
export declare function unique<T>(value: T[]): T[];
export declare function ensureArray<T>(value: T | T[]): T[];
