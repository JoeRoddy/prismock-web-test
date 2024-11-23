"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAutoIncrement = void 0;
exports.calculateDefaultFieldValue = calculateDefaultFieldValue;
exports.createDefaultValues = createDefaultValues;
exports.connectOrCreate = connectOrCreate;
exports.nestedCreate = nestedCreate;
exports.create = create;
const cuid2_1 = require("@paralleldrive/cuid2");
const bson_1 = require("bson");
const decimal_js_1 = __importDefault(require("decimal.js"));
const helpers_1 = require("../helpers");
const find_1 = require("./find");
const isAutoIncrement = (field) => {
    var _a;
    return ((_a = field.default) === null || _a === void 0 ? void 0 : _a.name) === 'autoincrement';
};
exports.isAutoIncrement = isAutoIncrement;
const defaultFieldhandlers = [
    [
        exports.isAutoIncrement,
        (properties, field) => {
            return (0, find_1.findNextIncrement)(properties, field.name);
        },
    ],
    [
        (field) => { var _a; return ((_a = field.default) === null || _a === void 0 ? void 0 : _a.name) === 'now'; },
        () => {
            return new Date();
        },
    ],
    [
        (field) => { var _a, _b; return (_b = (_a = field.default) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.includes('uuid'); },
        () => {
            return (0, helpers_1.uuid)();
        },
    ],
    [
        (field) => { var _a; return ((_a = field.default) === null || _a === void 0 ? void 0 : _a.name) === 'auto'; },
        () => {
            return new bson_1.ObjectId().toString();
        },
    ],
    [
        (field) => { var _a; return ((_a = field.default) === null || _a === void 0 ? void 0 : _a.name) === 'cuid'; },
        () => {
            return (0, cuid2_1.createId)();
        },
    ],
];
function calculateDefaultFieldValue(field, properties) {
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
        return new decimal_js_1.default(field.default);
    if (['string', 'number', 'boolean'].includes(typeof field.default))
        return field.default;
    return undefined;
}
function createDefaultValues(fields, properties) {
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
function connectOrCreate(delegate, delegates) {
    return (item) => {
        return Object.entries(item).reduce((accumulator, [key, value]) => {
            if (typeof value === 'object' && (value === null || value === void 0 ? void 0 : value.connectOrCreate)) {
                const connectOrCreate = value.connectOrCreate;
                const field = delegate.model.fields.find((field) => field.name === key);
                const subDelegate = (0, find_1.getDelegateFromField)(field, delegates);
                let connected = (0, find_1.findOne)({ where: connectOrCreate.where }, subDelegate, delegates);
                if (!connected)
                    connected = create(connectOrCreate.create, {}, subDelegate, delegates, subDelegate.onChange);
                return Object.assign(Object.assign({}, accumulator), (0, find_1.getFieldFromRelationshipWhere)(connected, field));
            }
            if (typeof value === 'object' && (value === null || value === void 0 ? void 0 : value.connect)) {
                const connect = value.connect;
                const field = delegate.model.fields.find((field) => field.name === key);
                const joinField = (0, find_1.getJoinField)(field, delegates);
                const subDelegate = (0, find_1.getDelegateFromField)(field, delegates);
                if (Array.isArray(connect)) {
                    connect.forEach((c) => {
                        subDelegate.update({
                            where: c,
                            data: (0, find_1.getFieldFromRelationshipWhere)(accumulator, joinField),
                        });
                    });
                }
                else {
                    if (field.relationFromFields.length > 0) {
                        const connected = (0, find_1.findOne)({ where: connect }, subDelegate, delegates);
                        if (connected) {
                            return Object.assign(Object.assign({}, accumulator), (0, find_1.getFieldFromRelationshipWhere)(connected, field));
                        }
                    }
                    else {
                        subDelegate.update({
                            where: connect,
                            data: Object.assign({}, (0, find_1.getFieldFromRelationshipWhere)(accumulator, joinField)),
                        });
                    }
                }
                return accumulator;
            }
            return Object.assign(Object.assign({}, accumulator), { [key]: value });
        }, {});
    };
}
function nestedCreate(current, delegates) {
    return (item) => {
        const created = Object.assign(Object.assign({}, createDefaultValues(current.model.fields, current.getProperties())), (0, helpers_1.removeUndefined)(item));
        current.model.fields.forEach((field) => {
            const value = created[field.name];
            if (value) {
                const joinfield = (0, find_1.getJoinField)(field, delegates);
                if (joinfield) {
                    const delegate = (0, find_1.getDelegateFromField)(field, delegates);
                    const connect = (0, find_1.getFieldFromRelationshipWhere)(created, joinfield);
                    if (value.create) {
                        delete created[field.name];
                        const data = value.create;
                        if (Array.isArray(data)) {
                            data.forEach((item) => {
                                create(Object.assign(Object.assign({}, item), connect), {}, delegate, delegates, delegate.onChange);
                            });
                        }
                        else {
                            const nestedCreated = create(Object.assign(Object.assign({}, data), connect), {}, delegate, delegates, delegate.onChange);
                            Object.assign(created, (0, find_1.getFieldFromRelationshipWhere)(nestedCreated, field));
                        }
                    }
                    if (value.createMany) {
                        delete created[field.name];
                        const { data } = value.createMany;
                        data.forEach((d) => {
                            create(Object.assign(Object.assign({}, d), connect), {}, delegate, delegates, delegate.onChange);
                        });
                    }
                }
            }
        });
        return created;
    };
}
function create(item, options, delegate, delegates, onChange) {
    const formated = (0, helpers_1.pipe)(nestedCreate(delegate, delegates), connectOrCreate(delegate, delegates))(item);
    const created = (0, helpers_1.pipe)((0, find_1.includes)(options, delegate, delegates), (0, find_1.select)(options.select))(formated);
    onChange([...delegate.getItems(), formated]);
    return created;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9vcGVyYXRpb25zL2NyZWF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUEyREEsZ0VBY0M7QUFFRCxrREFVQztBQUVELDBDQTZEQztBQUVELG9DQStDQztBQUVELHdCQWFDO0FBcE5ELGdEQUE4RDtBQUM5RCwrQkFBZ0M7QUFHaEMsNERBQWlDO0FBRWpDLHdDQUF5RDtBQUd6RCxpQ0FRZ0I7QUFFVCxNQUFNLGVBQWUsR0FBRyxDQUFDLEtBQWlCLEVBQUUsRUFBRTs7SUFDbkQsT0FBTyxDQUFBLE1BQUMsS0FBSyxDQUFDLE9BQTZCLDBDQUFFLElBQUksTUFBSyxlQUFlLENBQUM7QUFDeEUsQ0FBQyxDQUFDO0FBRlcsUUFBQSxlQUFlLG1CQUUxQjtBQUVGLE1BQU0sb0JBQW9CLEdBR3BCO0lBQ0o7UUFDRSx1QkFBZTtRQUNmLENBQUMsVUFBOEIsRUFBRSxLQUFpQixFQUFFLEVBQUU7WUFDcEQsT0FBTyxJQUFBLHdCQUFpQixFQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkQsQ0FBQztLQUNGO0lBQ0Q7UUFDRSxDQUFDLEtBQWlCLEVBQUUsRUFBRSxXQUFDLE9BQUEsQ0FBQSxNQUFDLEtBQUssQ0FBQyxPQUE2QiwwQ0FBRSxJQUFJLE1BQUssS0FBSyxDQUFBLEVBQUE7UUFDM0UsR0FBRyxFQUFFO1lBQ0gsT0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3BCLENBQUM7S0FDRjtJQUNEO1FBQ0UsQ0FBQyxLQUFpQixFQUFFLEVBQUUsZUFBQyxPQUFBLE1BQUEsTUFBQyxLQUFLLENBQUMsT0FBNkIsMENBQUUsSUFBSSwwQ0FBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUEsRUFBQTtRQUNuRixHQUFHLEVBQUU7WUFDSCxPQUFPLElBQUEsY0FBSSxHQUFFLENBQUM7UUFDaEIsQ0FBQztLQUNGO0lBQ0Q7UUFDRSxD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