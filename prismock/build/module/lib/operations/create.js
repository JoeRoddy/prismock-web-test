import { createId as createCuid } from '@paralleldrive/cuid2';
import { ObjectId } from 'bson';
import Decimal from 'decimal.js';
import { pipe, removeUndefined, uuid } from '../helpers';
import { findNextIncrement, findOne, getDelegateFromField, getFieldFromRelationshipWhere, getJoinField, includes, select, } from './find';
export const isAutoIncrement = (field) => {
    return field.default?.name === 'autoincrement';
};
const defaultFieldhandlers = [
    [
        isAutoIncrement,
        (properties, field) => {
            return findNextIncrement(properties, field.name);
        },
    ],
    [
        (field) => field.default?.name === 'now',
        () => {
            return new Date();
        },
    ],
    [
        (field) => field.default?.name?.includes('uuid'),
        () => {
            return uuid();
        },
    ],
    [
        (field) => field.default?.name === 'auto',
        () => {
            return new ObjectId().toString();
        },
    ],
    [
        (field) => field.default?.name === 'cuid',
        () => {
            return createCuid();
        },
    ],
];
export function calculateDefaultFieldValue(field, properties) {
    if (typeof field.default === 'object') {
        const handler = defaultFieldhandlers.find(([check]) => check(field));
        if (handler)
            return handler[1](properties, field);
    }
    if (field.type === 'BigInt' && typeof field.default === 'string')
        return BigInt(field.default);
    if (field.type === 'Json' && typeof field.default === 'string')
        return JSON.parse(field.default);
    if (field.type === 'Decimal' && typeof field.default === 'number')
        return new Decimal(field.default);
    if (['string', 'number', 'boolean'].includes(typeof field.default))
        return field.default;
    return undefined;
}
export function createDefaultValues(fields, properties) {
    return fields.reduce((defaultValues, currentField) => {
        if (currentField.hasDefaultValue === true) {
            const defaultValue = calculateDefaultFieldValue(currentField, properties);
            if (defaultValue !== undefined)
                defaultValues[currentField.name] = defaultValue;
        }
        else if (currentField.kind !== 'object') {
            defaultValues[currentField.name] = null;
        }
        return defaultValues;
    }, {});
}
export function connectOrCreate(delegate, delegates) {
    return (item) => {
        return Object.entries(item).reduce((accumulator, [key, value]) => {
            if (typeof value === 'object' && value?.connectOrCreate) {
                const connectOrCreate = value.connectOrCreate;
                const field = delegate.model.fields.find((field) => field.name === key);
                const subDelegate = getDelegateFromField(field, delegates);
                let connected = findOne({ where: connectOrCreate.where }, subDelegate, delegates);
                if (!connected)
                    connected = create(connectOrCreate.create, {}, subDelegate, delegates, subDelegate.onChange);
                return {
                    ...accumulator,
                    ...getFieldFromRelationshipWhere(connected, field),
                };
            }
            if (typeof value === 'object' && value?.connect) {
                const connect = value.connect;
                const field = delegate.model.fields.find((field) => field.name === key);
                const joinField = getJoinField(field, delegates);
                const subDelegate = getDelegateFromField(field, delegates);
                if (Array.isArray(connect)) {
                    connect.forEach((c) => {
                        subDelegate.update({
                            where: c,
                            data: getFieldFromRelationshipWhere(accumulator, joinField),
                        });
                    });
                }
                else {
                    if (field.relationFromFields.length > 0) {
                        const connected = findOne({ where: connect }, subDelegate, delegates);
                        if (connected) {
                            return {
                                ...accumulator,
                                ...getFieldFromRelationshipWhere(connected, field),
                            };
                        }
                    }
                    else {
                        subDelegate.update({
                            where: connect,
                            data: {
                                ...getFieldFromRelationshipWhere(accumulator, joinField),
                            },
                        });
                    }
                }
                return accumulator;
            }
            return {
                ...accumulator,
                [key]: value,
            };
        }, {});
    };
}
export function nestedCreate(current, delegates) {
    return (item) => {
        const created = {
            ...createDefaultValues(current.model.fields, current.getProperties()),
            ...removeUndefined(item),
        };
        current.model.fields.forEach((field) => {
            const value = created[field.name];
            if (value) {
                const joinfield = getJoinField(field, delegates);
                if (joinfield) {
                    const delegate = getDelegateFromField(field, delegates);
                    const connect = getFieldFromRelationshipWhere(created, joinfield);
                    if (value.create) {
                        delete created[field.name];
                        const data = value.create;
                        if (Array.isArray(data)) {
                            data.forEach((item) => {
                                create({ ...item, ...connect }, {}, delegate, delegates, delegate.onChange);
                            });
                        }
                        else {
                            const nestedCreated = create({ ...data, ...connect }, {}, delegate, delegates, delegate.onChange);
                            Object.assign(created, getFieldFromRelationshipWhere(nestedCreated, field));
                        }
                    }
                    if (value.createMany) {
                        delete created[field.name];
                        const { data } = value.createMany;
                        data.forEach((d) => {
                            create({ ...d, ...connect }, {}, delegate, delegates, delegate.onChange);
                        });
                    }
                }
            }
        });
        return created;
    };
}
export function create(item, options, delegate, delegates, onChange) {
    const formated = pipe(nestedCreate(delegate, delegates), connectOrCreate(delegate, delegates))(item);
    const created = pipe(includes(options, delegate, delegates), select(options.select))(formated);
    onChange([...delegate.getItems(), formated]);
    return created;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9vcGVyYXRpb25zL2NyZWF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxJQUFJLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzlELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHaEMsT0FBTyxPQUFPLE1BQU0sWUFBWSxDQUFDO0FBRWpDLE9BQU8sRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUd6RCxPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLE9BQU8sRUFDUCxvQkFBb0IsRUFDcEIsNkJBQTZCLEVBQzdCLFlBQVksRUFDWixRQUFRLEVBQ1IsTUFBTSxHQUNQLE1BQU0sUUFBUSxDQUFDO0FBRWhCLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxDQUFDLEtBQWlCLEVBQUUsRUFBRTtJQUNuRCxPQUFRLEtBQUssQ0FBQyxPQUE2QixFQUFFLElBQUksS0FBSyxlQUFlLENBQUM7QUFDeEUsQ0FBQyxDQUFDO0FBRUYsTUFBTSxvQkFBb0IsR0FHcEI7SUFDSjtRQUNFLGVBQWU7UUFDZixDQUFDLFVBQThCLEVBQUUsS0FBaUIsRUFBRSxFQUFFO1lBQ3BELE9BQU8saUJBQWlCLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBQ0Y7SUFDRDtRQUNFLENBQUMsS0FBaUIsRUFBRSxFQUFFLENBQUUsS0FBSyxDQUFDLE9BQTZCLEVBQUUsSUFBSSxLQUFLLEtBQUs7UUFDM0UsR0FBRyxFQUFFO1lBQ0gsT0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3BCLENBQUM7S0FDRjtJQUNEO1FBQ0UsQ0FBQyxLQUFpQixFQUFFLEVBQUUsQ0FBRSxLQUFLLENBQUMsT0FBNkIsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFD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