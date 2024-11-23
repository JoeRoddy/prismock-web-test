import { type PrismaClient } from '@prisma/client';
import { Delegate } from './delegate';
import { Data } from './prismock';
type GetData = () => Data;
type SetData = (data: Data) => void;
interface PrismockData {
    getData: GetData;
    setData: SetData;
    reset: () => void;
}
export type PrismockClientType<T = PrismaClient> = T & PrismockData;
export declare function generateClient<T = PrismaClient>(delegates: Record<string, Delegate>, getData: GetData, setData: SetData): PrismockClientType<T>;
type runtimeBaseDMMF = any;
export declare function createPrismock(dmmf: runtimeBaseDMMF): typeof PrismaClient & PrismockData;
export declare const PrismockClient: typeof PrismaClient & PrismockData;
export {};
