import { camelize, shallowCompare } from '../../helpers';
import { getFieldRelationshipWhere } from './find';
function formatValueWithMode(baseValue, filter, info) {
    const format = 'mode' in filter
        ? (baseValue) => (typeof baseValue === 'string' ? baseValue.toLocaleLowerCase() : baseValue)
        : (v) => v;
    if (info?.type === 'DateTime' && typeof baseValue === 'string') {
        return new Date(baseValue);
    }
    if (info?.type === 'BigInt' && typeof baseValue === 'number') {
        return BigInt(baseValue);
    }
    return format(baseValue);
}
export const matchMultiple = (item, where, current, delegates) => {
    const matchAnd = (item, where) => {
        return where.filter((child) => matchMultiple(item, child, current, delegates)).length === where.length;
    };
    const matchOr = (item, where) => {
        return where.some((child) => matchMultiple(item, child, current, delegates));
    };
    const matchFnc = (where, delegate = current) => (item) => {
        if (where) {
            return matchMultiple(item, where, delegate, delegates);
        }
        return true;
    };
    function match(child, item, where) {
        let val = item[child];
        const filter = where[child];
        if (child === 'OR')
            return matchOr(item, filter);
        if (child === 'AND')
            return matchAnd(item, filter);
        if (child === 'NOT')
            return !matchOr(item, filter instanceof Array ? filter : [filter]);
        if (child === 'is') {
            if (typeof filter === 'object') {
                return matchFnc(filter)(item);
            }
            return false;
        }
        if (filter === undefined) {
            return true;
        }
        if (filter === null) {
            const field = current.model.fields.find((field) => field.name === child);
            if (field?.relationFromFields && field.relationFromFields.length > 0) {
                return item[field.relationFromFields[0]] === null || item[field.relationFromFields[0]] === undefined;
            }
            return val === null || val === undefined;
        }
        // Support querying fields with bigint in query.
        if (typeof filter === 'bigint') {
            if (filter === BigInt(val)) {
                return true;
            }
        }
        if (filter instanceof Date) {
            if (val === undefined) {
                return false;
            }
            if (!(val instanceof Date) || val.getTime() !== filter.getTime()) {
                return false;
            }
        }
        else {
            if (typeof filter === 'object') {
                const info = current.model.fields.find((field) => field.name === child);
                val = formatValueWithMode(val, filter, info);
                if (info?.relationName) {
                    const childName = camelize(info.type);
                    let childWhere = {};
                    if (filter.every) {
                        childWhere = filter.every;
                    }
                    else if (filter.some) {
                        childWhere = filter.some;
                    }
                    else if (filter.none) {
                        childWhere = filter.none;
                    }
                    else {
                        childWhere = filter;
                    }
                    const res = delegates[childName]
                        .getItems()
                        .filter(matchFnc(Object.assign(Object.assign({}, childWhere), getFieldRelationshipWhere(item, info, delegates)), delegates[childName]));
                    if (filter.every) {
                        if (res.length === 0)
                            return false;
                        const all = delegates[childName].getItems().filter(matchFnc(getFieldRelationshipWhere(item, info, delegates)));
                        return res.length === all.length;
                    }
                    else if (filter.some) {
                        return res.length > 0;
                    }
                    else if (filter.is === null) {
                        return res.length === 0;
                    }
                    else if (filter.none) {
                        return res.length === 0;
                    }
                    return res.length > 0;
                }
                const compositeIndex = current.model.uniqueIndexes.map((index) => index.name).includes(child) || current.model.primaryKey?.name === child;
                if (compositeIndex) {
                    return matchMultiple(item, where[child], current, delegates);
                }
                const idFields = current.model.fields.map((field) => field.isId);
                if (idFields?.length > 1) {
                    if (child === idFields.join('_')) {
                        return shallowCompare(item, filter);
                    }
                }
                if (current.model.uniqueFields.length > 0) {
                    for (const uniqueField of current.model.uniqueFields) {
                        if (child === uniqueField.join('_')) {
                            return shallowCompare(item, filter);
                        }
                    }
                }
                if (val === undefined)
                    return false;
                let match = true;
                if ('equals' in filter && match) {
                    match = formatValueWithMode(filter.equals, filter, info) === val;
                }
                if ('startsWith' in filter && match) {
                    match = val.indexOf(formatValueWithMode(filter.startsWith, filter, info)) === 0;
                }
                if ('endsWith' in filter && match) {
                    match =
                        val.indexOf(formatValueWithMode(filter.endsWith, filter, info)) === val.length - filter.endsWith.length;
                }
                if ('contains' in filter && match) {
                    match = val.indexOf(formatValueWithMode(filter.contains, filter, info)) > -1;
                }
                if ('gt' in filter && match) {
                    match = val > formatValueWithMode(filter.gt, filter, info);
                }
                if ('gte' in filter && match) {
                    match = val >= formatValueWithMode(filter.gte, filter, info);
                }
                if ('lt' in filter && match) {
                    match = val !== null && val < formatValueWithMode(filter.lt, filter, info);
                }
                if ('lte' in filter && match) {
                    match = val !== null && val <= formatValueWithMode(filter.lte, filter, info);
                }
                if ('in' in filter && match) {
                    match = filter.in.map((inEntry) => formatValueWithMode(inEntry, filter, info)).includes(val);
                }
                if ('not' in filter && match) {
                    match = val !== formatValueWithMode(filter.not, filter);
                }
                if ('notIn' in filter && match) {
                    match = !filter.notIn.map((notInEntry) => formatValueWithMode(notInEntry, filter, info)).includes(val);
                }
                if (!match)
                    return false;
            }
            else if (val !== filter) {
                return false;
            }
        }
        return true;
    }
    for (const child in where) {
        if (!match(child, item, where)) {
            return false;
        }
    }
    return true;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL29wZXJhdGlvbnMvZmluZC9tYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUl6RCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFbkQsU0FBUyxtQkFBbUIsQ0FBSSxTQUFZLEVBQUUsTUFBd0MsRUFBRSxJQUF3QjtJQUM5RyxNQUFNLE1BQU0sR0FDVixNQUFNLElBQUksTUFBTTtRQUNkLENBQUMsQ0FBQyxDQUFJLFNBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLFNBQVMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFFLFNBQVMsQ0FBQyxpQkFBaUIsRUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDekcsQ0FBQyxDQUFDLENBQUksQ0FBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckIsSUFBSSxJQUFJLEVBQUUsSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUMvRCxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFJLElBQUksRUFBRSxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzdELE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLENBQUMsSUFBVSxFQUFFLEtBQW9CLEVBQUUsT0FBaUIsRUFBRSxTQUFvQixFQUFFLEVBQUU7SUFDekcsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUE2QixFQUFFLEtBQXNC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