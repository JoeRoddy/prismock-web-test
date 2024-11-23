"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFieldToRelationshipWhere = exports.getFieldFromRelationshipWhere = exports.getFieldRelationshipWhere = exports.getDelegateFromField = exports.getJoinField = void 0;
exports.findNextIncrement = findNextIncrement;
exports.findOne = findOne;
exports.where = where;
exports.calculateOrder = calculateOrder;
exports.calculateRelationOrder = calculateRelationOrder;
exports.order = order;
exports.paginate = paginate;
exports.includes = includes;
exports.select = select;
exports.findMany = findMany;
const helpers_1 = require("../../helpers");
const match_1 = require("./match");
function findNextIncrement(properties, fieldName) {
    const current = properties.increment[fieldName];
    const increment = (current !== null && current !== void 0 ? current : 0) + 1;
    Object.assign(properties.increment, { [fieldName]: increment });
    return increment;
}
function findOne(args, current, delegates) {
    const found = (0, helpers_1.pipe)((items) => items.filter((item) => where(args.where, current, delegates)(item)), order(args, current, delegates), connect(args, current, delegates), paginate(args.skip, args.take))(current.getItems()).at(0);
    if (!found)
        return null;
    return structuredClone(select(args.select)(found));
}
function where(whereArgs = {}, current, delegates) {
    return (item) => (0, match_1.matchMultiple)(item, whereArgs, current, delegates);
}
function getOrderedValue(orderedValue) {
    var _a;
    if (typeof orderedValue === 'object') {
        return {
            sortOrder: orderedValue.sort,
            nullOrder: (_a = orderedValue.nulls) !== null && _a !== void 0 ? _a : 'last',
        };
    }
    return {
        sortOrder: orderedValue,
        nullOrder: 'last',
    };
}
function isOrderByRelation(orderedProperties) {
    const orderedProperty = Object.keys(orderedProperties)[0];
    return Object.keys(orderedProperties[orderedProperty]).includes('_count');
}
function calculateOrder(a, b, orderedProperties, current, delegates) {
    for (const orderedProperty in orderedProperties) {
        if (isOrderByRelation(orderedProperties)) {
            const sortOrder = Object.values(orderedProperties[orderedProperty])[0];
            return calculateRelationOrder(a, b, orderedProperty, sortOrder, current, delegates);
        }
        const { nullOrder, sortOrder } = getOrderedValue(orderedProperties[orderedProperty]);
        let weight = 0;
        const weightMultiplier = sortOrder === 'desc' ? -1 : 1;
        const values = [a[orderedProperty], b[orderedProperty]];
        if (values.every((value) => value === null)) {
            return 0;
        }
        else if (values.some((value) => value === null)) {
            if (values[0] === null)
                weight = -1;
            if (values[1] === null)
                weight = 1;
            if (nullOrder === 'last')
                return weight * -1;
            else
                return weight;
        }
        if (typeof values[0] === 'number' && typeof values[1] === 'number') {
            weight = values[0] - values[1];
        }
        if (typeof values[0] === 'string' && typeof values[1] === 'string') {
            weight = values[0].localeCompare(values[1]);
        }
        if (values[0] instanceof Date && values[1] instanceof Date) {
            weight = values[0].getTime() - values[1].getTime();
        }
        if (weight !== 0)
            return weight * weightMultiplier;
    }
    return 0;
}
function calculateRelationOrder(a, b, orderedProperty, sortOrder, current, delegates) {
    const schema = current.model.fields.find((field) => field.name === orderedProperty);
    if (!(schema === null || schema === void 0 ? void 0 : schema.relationName))
        return 0;
    const delegate = (0, exports.getDelegateFromField)(schema, delegates);
    const field = (0, exports.getJoinField)(schema, delegates);
    const counts = {
        a: findMany({
            where: (0, exports.getFieldFromRelationshipWhere)(a, field),
        }, delegate, delegates).length,
        b: findMany({
            where: (0, exports.getFieldFromRelationshipWhere)(b, field),
        }, delegate, delegates).length,
    };
    const weightMultiplier = sortOrder === 'desc' ? -1 : 1;
    const weight = counts.a - counts.b;
    if (weight !== 0)
        return weight * weightMultiplier;
    return 0;
}
function order(args, delegate, delegates) {
    return (items) => {
        if (!args.orderBy)
            return items;
        const propertiesToOrderBy = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
        const o = propertiesToOrderBy.reduceRight((accumulator, currentValue) => {
            const acc = accumulator.sort((a, b) => calculateOrder(a, b, currentValue, delegate, delegates));
            return acc;
        }, items);
        return o;
    };
}
function paginate(skip, take) {
    return (items) => {
        if (!skip && !take)
            return items;
        return items.slice(skip !== null && skip !== void 0 ? skip : 0, take === undefined ? undefined : take + (skip !== null && skip !== void 0 ? skip : 0));
    };
}
function includes(args, current, delegates) {
    return (item) => {
        var _a;
        if ((!(args === null || args === void 0 ? void 0 : args.include) && !(args === null || args === void 0 ? void 0 : args.select)) || !item)
            return item;
        const newItem = Object.assign({}, item);
        const obj = (_a = args === null || args === void 0 ? void 0 : args.select) !== null && _a !== void 0 ? _a : args.include;
        Object.keys(obj)
            .filter((key) => !!obj[key])
            .forEach((key) => {
            const schema = current.model.fields.find((field) => field.name === key);
            if (!(schema === null || schema === void 0 ? void 0 : schema.relationName))
                return;
            const delegate = (0, exports.getDelegateFromField)(schema, delegates);
            let subArgs = obj[key] === true ? {} : obj[key];
            subArgs = Object.assign(Object.assign({}, subArgs), {
                where: Object.assign(Object.assign({}, subArgs.where), (0, exports.getFieldRelationshipWhere)(item, schema, delegates)),
            });
            if (schema.isList) {
                Object.assign(newItem, { [key]: findMany(subArgs, delegate, delegates) });
            }
            else {
                Object.assign(newItem, { [key]: findOne(subArgs, delegate, delegates) });
            }
        });
        return newItem;
    };
}
function select(selectArgs) {
    return (item) => {
        if (!selectArgs)
            return item;
        return Object.entries(item).reduce((accumulator, [key, value]) => {
            if (selectArgs[key]) {
                accumulator[key] = value;
            }
            return accumulator;
        }, {});
    };
}
const getJoinField = (field, delegates) => {
    const joinDelegate = Object.values(delegates).find((delegate) => {
        return delegate.model.name === field.type;
    });
    const joinfield = joinDelegate === null || joinDelegate === void 0 ? void 0 : joinDelegate.model.fields.find((f) => {
        return f.relationName === field.relationName;
    });
    return joinfield;
};
exports.getJoinField = getJoinField;
const getDelegateFromField = (field, delegates) => {
    const delegateName = (0, helpers_1.camelize)(field.type);
    return delegates[delegateName];
};
exports.getDelegateFromField = getDelegateFromField;
const getFieldRelationshipWhere = (item, field, delegates) => {
    var _a;
    if (((_a = field.relationToFields) === null || _a === void 0 ? void 0 : _a.length) === 0) {
        field = (0, exports.getJoinField)(field, delegates);
        return {
            [field.relationFromFields[0]]: item[field.relationToFields[0]],
        };
    }
    return {
        [field.relationToFields[0]]: item[field.relationFromFields[0]],
    };
};
exports.getFieldRelationshipWhere = getFieldRelationshipWhere;
const getFieldFromRelationshipWhere = (item, field) => {
    return {
        [field.relationFromFields[0]]: item[field.relationToFields[0]],
    };
};
exports.getFieldFromRelationshipWhere = getFieldFromRelationshipWhere;
const getFieldToRelationshipWhere = (item, field) => {
    return {
        [field.relationToFields[0]]: item[field.relationFromFields[0]],
    };
};
exports.getFieldToRelationshipWhere = getFieldToRelationshipWhere;
function connect(args, current, delegates) {
    return (items) => {
        return items.reduce((accumulator, currentValue) => {
            const item = (0, helpers_1.pipe)(includes(args, current, delegates), select(args.select))(currentValue);
            return [...accumulator, item];
        }, []);
    };
}
function findMany(args, current, delegates) {
    const found = (0, helpers_1.pipe)((items) => items.filter((item) => where(args.where, current, delegates)(item)), order(args, current, delegates), connect(args, current, delegates), paginate(args.skip, args.take))(current.getItems());
    if (args === null || args === void 0 ? void 0 : args.distinct) {
        const values = {};
        return found.filter((item) => {
            let shouldInclude = true;
            args.distinct.forEach((key) => {
                const vals = values[key] || [];
                if (vals.includes(item[key])) {
                    shouldInclude = false;
                }
                else {
                    vals.push(item[key]);
                    values[key] = vals;
                }
            });
            return shouldInclude;
        });
    }
    return structuredClone(found);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvb3BlcmF0aW9ucy9maW5kL2ZpbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBU0EsOENBT0M7QUFFRCwwQkFXQztBQUVELHNCQUVDO0FBcUJELHdDQThDQztBQUVELHdEQXFDQztBQUVELHNCQVdDO0FBRUQsNEJBS0M7QUFFRCw0QkFnQ0M7QUFFRCx3QkFVQztBQXdERCw0QkEwQkM7QUEzUkQsMkNBQStDO0FBRy9DLG1DQUF3QztBQUV4QyxTQUFnQixpQkFBaUIsQ0FBQyxVQUE4QixFQUFFLFNBQWlCO0lBQ2pGLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxPQUFPLGFBQVAsT0FBTyxjQUFQLE9BQU8sR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFckMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBRWhFLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFnQixPQUFPLENBQUMsSUFBYyxFQUFFLE9BQWlCLEVBQUUsU0FBb0I7SUFDN0UsTUFBTSxLQUFLLEdBQUcsSUFBQSxjQUFJLEVBQ2hCLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDdEYsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQy9CLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUNqQyxR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