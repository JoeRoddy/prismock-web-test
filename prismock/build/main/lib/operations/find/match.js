"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchMultiple = void 0;
const helpers_1 = require("../../helpers");
const find_1 = require("./find");
function formatValueWithMode(baseValue, filter, info) {
    const format = 'mode' in filter
        ? (baseValue) => (typeof baseValue === 'string' ? baseValue.toLocaleLowerCase() : baseValue)
        : (v) => v;
    if ((info === null || info === void 0 ? void 0 : info.type) === 'DateTime' && typeof baseValue === 'string') {
        return new Date(baseValue);
    }
    if ((info === null || info === void 0 ? void 0 : info.type) === 'BigInt' && typeof baseValue === 'number') {
        return BigInt(baseValue);
    }
    return format(baseValue);
}
const matchMultiple = (item, where, current, delegates) => {
    const matchAnd = (item, where) => {
        return where.filter((child) => (0, exports.matchMultiple)(item, child, current, delegates)).length === where.length;
    };
    const matchOr = (item, where) => {
        return where.some((child) => (0, exports.matchMultiple)(item, child, current, delegates));
    };
    const matchFnc = (where, delegate = current) => (item) => {
        if (where) {
            return (0, exports.matchMultiple)(item, where, delegate, delegates);
        }
        return true;
    };
    function match(child, item, where) {
        var _a;
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
            if ((field === null || field === void 0 ? void 0 : field.relationFromFields) && field.relationFromFields.length > 0) {
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
                if (info === null || info === void 0 ? void 0 : info.relationName) {
                    const childName = (0, helpers_1.camelize)(info.type);
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
                        .filter(matchFnc(Object.assign(Object.assign({}, childWhere), (0, find_1.getFieldRelationshipWhere)(item, info, delegates)), delegates[childName]));
                    if (filter.every) {
                        if (res.length === 0)
                            return false;
                        const all = delegates[childName].getItems().filter(matchFnc((0, find_1.getFieldRelationshipWhere)(item, info, delegates)));
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
                const compositeIndex = current.model.uniqueIndexes.map((index) => index.name).includes(child) || ((_a = current.model.primaryKey) === null || _a === void 0 ? void 0 : _a.name) === child;
                if (compositeIndex) {
                    return (0, exports.matchMultiple)(item, where[child], current, delegates);
                }
                const idFields = current.model.fields.map((field) => field.isId);
                if ((idFields === null || idFields === void 0 ? void 0 : idFields.length) > 1) {
                    if (child === idFields.join('_')) {
                        return (0, helpers_1.shallowCompare)(item, filter);
                    }
                }
                if (current.model.uniqueFields.length > 0) {
                    for (const uniqueField of current.model.uniqueFields) {
                        if (child === uniqueField.join('_')) {
                            return (0, helpers_1.shallowCompare)(item, filter);
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
exports.matchMultiple = matchMultiple;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL29wZXJhdGlvbnMvZmluZC9tYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSwyQ0FBeUQ7QUFJekQsaUNBQW1EO0FBRW5ELFNBQVMsbUJBQW1CLENBQUksU0FBWSxFQUFFLE1BQXdDLEVBQUUsSUFBd0I7SUFDOUcsTUFBTSxNQUFNLEdBQ1YsTUFBTSxJQUFJLE1BQU07UUFDZCxDQUFDLENBQUMsQ0FBSSxTQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBRSxTQUFTLENBQUMsaUJBQWlCLEVBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3pHLENBQUMsQ0FBQyxDQUFJLENBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxNQUFLLFVBQVUsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUMvRCxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFJLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLElBQUksTUFBSyxRQUFRLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDN0QsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFFTSxNQUFNLGFBQWEsR0FBRyxDQUFDLElBQVUsRUFBRSxLQUFvQixFQUFFLE9BQWlCLEVBQUUsU0FBb0IsRUFBRSxFQUFFO0lBQ3pHLE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBNkIsRUFBRSxLQUFzQixFQUFFLEVBQUU7UUFDekUsT0FBTyxL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