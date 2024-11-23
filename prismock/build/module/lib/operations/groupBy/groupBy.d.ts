import { Delegate } from '../../delegate';
import { Delegates } from '../../prismock';
import { GroupByArgs } from '../../types';
export declare function groupBy(args: GroupByArgs, current: Delegate, delegates: Delegates): {
    _avg?: Record<string, number>;
    _count?: number | Record<string, number>;
    _max?: Record<string, number>;
    _min?: Record<string, number>;
    _sum?: Record<string, number>;
}[];
