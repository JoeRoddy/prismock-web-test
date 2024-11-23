import { Item } from '../delegate';
import { AggregateArgs } from '../types';
type AggregateResult = {
    _avg?: Record<string, number>;
    _count?: number | Record<string, number>;
    _max?: Record<string, number>;
    _min?: Record<string, number>;
    _sum?: Record<string, number>;
};
export declare function aggregate(args: AggregateArgs, items: Item[]): AggregateResult;
export {};
