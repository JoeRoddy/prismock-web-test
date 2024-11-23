import { DMMF } from '@prisma/generator-helper';
import { Delegate, DelegateProperties, Item } from '../delegate';
import { Delegates } from '../prismock';
import { CreateArgs } from '../types';
export declare const isAutoIncrement: (field: DMMF.Field) => boolean;
export declare function calculateDefaultFieldValue(field: DMMF.Field, properties: DelegateProperties): unknown;
export declare function createDefaultValues(fields: DMMF.Field[], properties: DelegateProperties): Record<string, unknown>;
export declare function connectOrCreate(delegate: Delegate, delegates: Delegates): (item: Item) => Item;
export declare function nestedCreate(current: Delegate, delegates: Delegates): (item: Item) => {
    [x: string]: unknown;
};
export declare function create(item: Item, options: Omit<CreateArgs, 'data'>, delegate: Delegate, delegates: Delegates, onChange: (items: Item[]) => void): Record<string, unknown>;
