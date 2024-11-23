import { DMMF } from '@prisma/generator-helper';
import { DeleteArgs, UpdateArgs } from './operations';
import { Data, Delegates, Properties } from './prismock';
import { CreateArgs, CreateManyArgs, FindArgs, GroupByArgs, UpsertArgs } from './types';
export type Item = Record<string, unknown>;
export type Delegate = {
    create: (args: CreateArgs) => Promise<Item>;
    createMany: (args: CreateManyArgs) => Promise<{
        count: number;
    }>;
    delete: (args: DeleteArgs) => Promise<Item | null>;
    deleteMany: (args: DeleteArgs) => Promise<{
        count: number;
    }>;
    update: (args: UpdateArgs) => Promise<Item | null>;
    updateMany: (args: UpdateArgs) => Promise<{
        count: number;
    }>;
    upsert: (args: UpsertArgs) => Promise<Item>;
    findMany: (args?: FindArgs) => Promise<Item[]>;
    findUnique: (args: FindArgs) => Promise<Item>;
    findFirst: (args: FindArgs) => Promise<Item>;
    findUniqueOrThrow: (args: FindArgs) => Promise<Item>;
    findFirstOrThrow: (args: FindArgs) => Promise<Item>;
    groupBy: (args: GroupByArgs) => Promise<any[]>;
    count: (args: FindArgs) => Promise<number>;
    model: DMMF.Model;
    getProperties: () => DelegateProperties;
    getItems: () => Item[];
    onChange: (items: Item[]) => void;
};
export type DelegateProperties = {
    increment: Record<string, number>;
};
export type DelegateContext = {
    models: DMMF.Model[];
    model: DMMF.Model;
    name: string;
    data: Data;
    properties: Record<string, DelegateProperties>;
};
export declare function generateDelegate(model: DMMF.Model, data: Data, name: string, properties: Properties, delegates: Delegates, onChange: (items: Item[]) => void): Delegate;
