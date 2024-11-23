import { DMMF } from '@prisma/generator-helper';
import { Delegate, DelegateProperties, Item } from './delegate';
type OptionsSync = {
    models: DMMF.Model[];
};
export type Data = Record<string, Item[]>;
export type Properties = Record<string, DelegateProperties>;
export type Delegates = Record<string, Delegate>;
export declare function generateDelegates(options: OptionsSync): {
    delegates: Delegates;
    getData: () => Data;
    setData: (d: Data) => void;
};
export {};
