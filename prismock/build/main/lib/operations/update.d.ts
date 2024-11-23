import { Delegate, Item } from '../delegate';
import { Delegates } from '../prismock';
import { FindWhereArgs, SelectArgs } from '../types';
export type UpdateArgs = {
    select?: SelectArgs | null;
    include?: Record<string, boolean> | null;
    data: Item;
    where: FindWhereArgs;
};
export type UpdateMap = {
    toUpdate: Item[];
    updated: Item[];
};
export declare function updateMany(args: UpdateArgs, current: Delegate, delegates: Delegates, onChange: (items: Item[]) => void): Record<string, unknown>[];
