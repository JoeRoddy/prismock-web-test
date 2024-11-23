import { Delegates } from '../prismock';
import { Item, Delegate } from '../delegate';
import { FindWhereArgs, SelectArgs } from '../types';
export type DeleteArgs = {
    select?: SelectArgs | null;
    include?: Record<string, boolean> | null;
    where?: FindWhereArgs;
};
export type DeletionMap = {
    toDelete: Item[];
    withoutDeleted: Item[];
};
export declare function deleteMany(args: DeleteArgs, current: Delegate, delegates: Delegates, onChange: (items: Item[]) => void): Record<string, unknown>[];
