
import { DMMF } from '@prisma/generator-helper';

import { Delegate, DelegateProperties, generateDelegate, Item } from './delegate';
import { camelize, omit } from './helpers';
import { isAutoIncrement } from './operations';


type OptionsSync = {
  models: DMMF.Model[];
};

export type Data = Record<string, Item[]>;
export type Properties = Record<string, DelegateProperties>;
export type Delegates = Record<string, Delegate>;

export function generateDelegates(options: OptionsSync) {
  const models = options.models ?? [];
  const data: Data = {};
  const properties: Properties = {};
  const delegates: Delegates = {};

  function getData() {
    return data;
  }

  function setData(d: Data) {
    // eslint-disable-next-line no-console
    console.log(
      'Deprecation notice: setData will be removed in a future version and should not be used anymore. Please use a mix of "reset" and create/createMany to achieve the same result',
    );

    Object.assign(data, d);
    Object.assign(
      properties,
      Object.entries(d).reduce((accumulator, [currentKey]) => {
        const model = models.find((m) => camelize(m.name) === currentKey) as DMMF.Model;
        return {
          ...accumulator,
          [currentKey]: {
            increment: model.fields.reduce((propertiesAccumulator: Record<string, number>, currentField) => {
              if (isAutoIncrement(currentField)) {
                return { ...propertiesAccumulator, [currentField.name]: d[currentKey].length };
              }
              return propertiesAccumulator;
            }, {}),
          },
        };
      }, {}),
    );
  }

  models.forEach((model) => {
    const name = camelize(model.name);
    data[name] = [];
    properties[name] = {
      increment: {},
    };

    Object.assign(delegates, {
      [name]: generateDelegate(model, data, name, properties, delegates, (items) => {
        Object.assign(data, { [name]: items });
      }),
    });
  }, {});

  const clientDelegates = Object.entries(delegates).reduce((accumulator, [delegateKey, delegateValue]) => {
    return {
      ...accumulator,
      [delegateKey]: omit(delegateValue, ['model', 'properties', 'getItems']) as Delegate,
    };
  }, {} as Delegates);

  return { delegates: clientDelegates, getData, setData };
}
