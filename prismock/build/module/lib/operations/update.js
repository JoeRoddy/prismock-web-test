import { camelize, pipe, removeUndefined } from '../helpers';
import { calculateDefaultFieldValue, connectOrCreate, create } from './create';
import { findOne, getDelegateFromField, getFieldFromRelationshipWhere, getFieldRelationshipWhere, getJoinField, includes, select, where, } from './find';
const update = (args, isCreating, item, current, delegates) => {
    const { data } = args;
    current.model.fields.forEach((field) => {
        if (data[field.name]) {
            const fieldData = data[field.name];
            if (field.kind === 'object') {
                if (fieldData.connect) {
                    const connected = data[field.name];
                    delete data[field.name];
                    const delegate = delegates[camelize(field.type)];
                    const joinfield = getJoinField(field, delegates);
                    const joinValue = connected.connect[joinfield.relationToFields[0]];
                    // @TODO: what's happening if we try to udate on an Item that doesn't exist?
                    if (!joinfield.isList) {
                        const joined = findOne({ where: args.where }, getDelegateFromField(joinfield, delegates), delegates);
                        delegate.updateMany({
                            where: { [joinfield.relationToFields[0]]: joinValue },
                            data: getFieldFromRelationshipWhere(joined, joinfield),
                        });
                    }
                    else {
                        const joined = findOne({ where: connected.connect }, getDelegateFromField(field, delegates), delegates);
                        Object.assign(data, getFieldFromRelationshipWhere(joined, field));
                    }
                }
                if (fieldData.connectOrCreate) {
                    delete data[field.name];
                    const delegate = getDelegateFromField(field, delegates);
                    connectOrCreate(current, delegates)({ [camelize(field.name)]: fieldData });
                    const joined = findOne({ where: fieldData.connectOrCreate.where }, delegate, delegates);
                    Object.assign(data, getFieldFromRelationshipWhere(joined, field));
                }
                if (fieldData.create || fieldData.createMany) {
                    const toCreate = data[field.name];
                    delete data[field.name];
                    const delegate = getDelegateFromField(field, delegates);
                    const joinfield = getJoinField(field, delegates);
                    if (field.relationFromFields?.[0]) {
                        delegate.create(data[field.name].create);
                        Object.assign(data, getFieldFromRelationshipWhere(item, field));
                    }
                    else {
                        const formatCreatedItem = (val) => {
                            return {
                                ...val,
                                [joinfield.name]: {
                                    connect: joinfield.relationToFields.reduce((prev, cur) => {
                                        let val = data[cur];
                                        if (!isCreating && !val) {
                                            val = findOne(args, delegates[camelize(joinfield.type)], delegates)?.[cur];
                                        }
                                        return { ...prev, [cur]: val };
                                    }, {}),
                                },
                            };
                        };
                        if (fieldData.createMany) {
                            fieldData.createMany.data
                                .map(formatCreatedItem)
                                .forEach((createSingle) => delegate.create({ data: createSingle }));
                        }
                        else {
                            if (Array.isArray(fieldData.create)) {
                                fieldData.create
                                    .map(formatCreatedItem)
                                    .forEach((createSingle) => delegate.create({ data: createSingle }));
                            }
                            else {
                                const createData = { ...toCreate.create };
                                const mapped = formatCreatedItem(toCreate.create)[joinfield.name].connect;
                                if (joinfield) {
                                    Object.assign(createData, getFieldFromRelationshipWhere(mapped, joinfield));
                                }
                                delegate.create({ data: createData });
                            }
                        }
                    }
                }
                if (fieldData.update || fieldData.updateMany) {
                    const joinfield = getJoinField(field, delegates);
                    const where = {};
                    if (joinfield) {
                        Object.assign(where, getFieldFromRelationshipWhere(args.where, joinfield));
                    }
                    delete data[field.name];
                    const delegate = delegates[camelize(field.type)];
                    if (fieldData.updateMany) {
                        Object.assign(where, fieldData.updateMany.where);
                        if (Array.isArray(fieldData.updateMany)) {
                            fieldData.updateMany.forEach((toUpdateMany) => {
                                delegate.updateMany({ where, data: toUpdateMany.data ?? toUpdateMany });
                            });
                        }
                        else {
                            delegate.updateMany({ where, data: fieldData.updateMany.data ?? fieldData.updateMany });
                        }
                    }
                    else {
                        const joinfield = getJoinField(field, delegates);
                        Object.assign(where, fieldData.update.where);
                        if (Array.isArray(fieldData.update)) {
                            fieldData.update.forEach((toUpdate) => {
                                delegate.updateMany({ where, data: toUpdate.data ?? toUpdate });
                            });
                        }
                        else {
                            const item = findOne(args, delegates[camelize(joinfield.type)], delegates);
                            delegate.updateMany({
                                where: getFieldRelationshipWhere(item, field, delegates),
                                data: fieldData.update.data ?? fieldData.update,
                            });
                        }
                    }
                }
                if (fieldData.upsert) {
                    const upsert = fieldData.upsert;
                    delete data[field.name];
                    const subDelegate = delegates[camelize(field.type)];
                    const item = findOne({ where: args.where }, current, delegates);
                    if (item) {
                        const joinWhere = getFieldRelationshipWhere(item, field, delegates);
                        const joined = Object.values(joinWhere)[0] ? findOne({ where: joinWhere }, subDelegate, delegates) : null;
                        if (joined) {
                            updateMany({ where: joinWhere, data: upsert.update }, subDelegate, delegates, subDelegate.onChange);
                        }
                        else {
                            const created = create(upsert.create, {}, subDelegate, delegates, subDelegate.onChange);
                            Object.assign(data, getFieldFromRelationshipWhere(created, field));
                        }
                    }
                }
            }
            if (field.isList) {
                if (fieldData.push && typeof fieldData.push !== 'function') {
                    if (Array.isArray(fieldData.push))
                        Object.assign(data, { [field.name]: item[field.name].concat(fieldData.push) });
                    else
                        Object.assign(data, { [field.name]: item[field.name].concat([fieldData.push]) });
                }
            }
            if (fieldData.increment) {
                Object.assign(data, { [field.name]: item[field.name] + fieldData.increment });
            }
            if (fieldData.decrement) {
                Object.assign(data, { [field.name]: item[field.name] - fieldData.decrement });
            }
            if (fieldData.multiply) {
                Object.assign(data, { [field.name]: item[field.name] * fieldData.multiply });
            }
            if (fieldData.divide) {
                Object.assign(data, { [field.name]: item[field.name] / fieldData.divide });
            }
            if (fieldData.set) {
                Object.assign(data, { [field.name]: fieldData.set });
            }
        }
        if ((isCreating || data[field.name] === null) && (data[field.name] === null || data[field.name] === undefined)) {
            if (field.hasDefaultValue) {
                const defaultValue = calculateDefaultFieldValue(field, current.getProperties());
                if (defaultValue !== undefined && !data[field.name])
                    Object.assign(data, { [field.name]: defaultValue });
            }
            else if (field.kind !== 'object')
                Object.assign(data, Object.assign(data, { [field.name]: null }));
        }
    });
    return data;
};
export function updateMany(args, current, delegates, onChange) {
    const { toUpdate, updated } = current.getItems().reduce((accumulator, currentValue) => {
        const shouldUpdate = where(args.where, current, delegates)(currentValue);
        if (shouldUpdate) {
            const baseValue = {
                ...currentValue,
                ...removeUndefined(update(args, false, currentValue, current, delegates)),
            };
            const updated = pipe(includes(args, current, delegates), select(args.select))(baseValue);
            return {
                toUpdate: [...accumulator.toUpdate, updated],
                updated: [...accumulator.updated, baseValue],
            };
        }
        return {
            toUpdate: accumulator.toUpdate,
            updated: [...accumulator.updated, currentValue],
        };
    }, { toUpdate: [], updated: [] });
    onChange(updated);
    return toUpdate;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9vcGVyYXRpb25zL3VwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFJN0QsT0FBTyxFQUFFLDBCQUEwQixFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDL0UsT0FBTyxFQUNMLE9BQU8sRUFDUCxvQkFBb0IsRUFDcEIsNkJBQTZCLEVBQzdCLHlCQUF5QixFQUN6QixZQUFZLEVBQ1osUUFBUSxFQUNSLE1BQU0sRUFDTixLQUFLLEdBQ04sTUFBTSxRQUFRLENBQUM7QUFjaEIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFnQixFQUFFLFVBQW1CLEVBQUUsSUFBVSxFQUFFLE9BQWlCLEVBQUUsU0FBb0IsRUFBRSxFQUFFO0lBQzVHLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBUSxJQUFJLENBQUM7SUFFM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDckMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDckIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQzVCLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXhCLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FB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Q0FBQyxTQUFvQixFQUFFLENBQUMsQ0FBQztZQUN4RyxDQUFDO1lBQ0QsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQVksR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUM1RixDQUFDO1lBQ0QsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQVksR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMzRixDQUFDO1lBQ0QsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUN6RixDQUFDO1lBQ0QsSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2xCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDL0csSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sWUFBWSxHQUFHLDBCQUEwQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDaEYsSUFBSSxZQUFZLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQzNHLENBQUM7aUJBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVE7Z0JBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkcsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFZLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLFVBQVUsQ0FBQyxJQUFnQixFQUFFLE9BQWlCLEVBQUUsU0FBb0IsRUFBRSxRQUFpQztJQUNySCxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQ3JELENBQUMsV0FBc0IsRUFBRSxZQUFrQixFQUFFLEVBQUU7UUFDN0MsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXpFLElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsTUFBTSxTQUFTLEdBQUc7Z0JBQ2hCLEdBQUcsWUFBWTtnQkFDZixHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQzFFLENBQUM7WUFFRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXpGLE9BQU87Z0JBQ0wsUUFBUSxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQztnQkFDNUMsT0FBTyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQzthQUM3QyxDQUFDO1FBQ0osQ0FBQztRQUNELE9BQU87WUFDTCxRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVE7WUFDOUIsT0FBTyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQztTQUNoRCxDQUFDO0lBQ0osQ0FBQyxFQUNELEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQzlCLENBQUM7SUFFRixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbEIsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQyJ9