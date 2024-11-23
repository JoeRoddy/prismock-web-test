"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDelegate = generateDelegate;
const operations_1 = require("./operations");
function generateDelegate(model, data, name, properties, delegates, onChange) {
    const delegate = {};
    Object.assign(delegate, {
        delete: (args = {}) => {
            const deleted = (0, operations_1.deleteMany)(args, delegate, delegates, onChange);
            if (deleted.length === 0)
                return Promise.reject(new Error());
            return Promise.resolve(deleted[0]);
        },
        deleteMany: (args = {}) => {
            const deleted = (0, operations_1.deleteMany)(args, delegate, delegates, onChange);
            return Promise.resolve({ count: deleted.length });
        },
        update: (args) => {
            var _a;
            const updated = (0, operations_1.updateMany)(args, delegate, delegates, onChange);
            return Promise.resolve((_a = updated[0]) !== null && _a !== void 0 ? _a : null);
        },
        updateMany: (args) => {
            const updated = (0, operations_1.updateMany)(args, delegate, delegates, onChange);
            return Promise.resolve({ count: updated.length });
        },
        create: (args) => {
            const { data } = args, options = __rest(args, ["data"]);
            return Promise.resolve((0, operations_1.create)(data, options, delegate, delegates, onChange));
        },
        createMany: (args) => {
            const { data } = args, options = __rest(args, ["data"]);
            data.forEach((d) => {
                (0, operations_1.create)(d, options, delegate, delegates, onChange);
            });
            return Promise.resolve({ count: args.data.length });
        },
        upsert: (args) => {
            var _a;
            const res = (0, operations_1.findOne)(args, delegate, delegates);
            if (res) {
                const updated = (0, operations_1.updateMany)(Object.assign(Object.assign({}, args), { data: args.update }), delegate, delegates, onChange);
                return Promise.resolve((_a = updated[0]) !== null && _a !== void 0 ? _a : null);
            }
            else {
                const { create: data } = args, options = __rest(args, ["create"]);
                return Promise.resolve((0, operations_1.create)(data, options, delegate, delegates, onChange));
            }
        },
        findMany: (args = {}) => {
            return Promise.resolve((0, operations_1.findMany)(args, delegate, delegates));
        },
        findUnique: (args = {}) => {
            return Promise.resolve((0, operations_1.findOne)(args, delegate, delegates));
        },
        findFirst: (args = {}) => {
            return Promise.resolve((0, operations_1.findOne)(args, delegate, delegates));
        },
        findUniqueOrThrow: (args = {}) => {
            const found = (0, operations_1.findOne)(args, delegate, delegates);
            if (!found)
                return Promise.reject(new Error());
            return Promise.resolve(found);
        },
        findFirstOrThrow: (args = {}) => {
            const found = (0, operations_1.findOne)(args, delegate, delegates);
            if (!found)
                return Promise.reject(new Error());
            return Promise.resolve(found);
        },
        count: (args = {}) => {
            const found = (0, operations_1.findMany)(args, delegate, delegates);
            return Promise.resolve(found.length);
        },
        aggregate: (args = {}) => {
            const found = (0, operations_1.findMany)(args, delegate, delegates);
            const aggregated = (0, operations_1.aggregate)(args, found);
            return Promise.resolve(aggregated);
        },
        groupBy: (args) => {
            return Promise.resolve((0, operations_1.groupBy)(args, delegate, delegates));
        },
        createManyAndReturn: (args) => {
            const { data } = args, options = __rest(args, ["data"]);
            const created = data.map((d) => (0, operations_1.create)(d, options, delegate, delegates, onChange));
            return Promise.resolve(created);
        },
        model,
        getItems: () => data[name],
        getProperties: () => properties[name],
        onChange,
    });
    return delegate;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZWdhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RlbGVnYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUEwQ0EsNENBOEZDO0FBdElELDZDQUE2SDtBQXdDN0gsU0FBZ0IsZ0JBQWdCLENBQzlCLEtBQWlCLEVBQ2pCLElBQVUsRUFDVixJQUFZLEVBQ1osVUFBc0IsRUFDdEIsU0FBb0IsRUFDcEIsUUFBaUM7SUFFakMsTUFBTSxRQUFRLEdBQUcsRUFBYyxDQUFDO0lBRWhDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1FBQ3RCLE1BQU0sRUFBRSxDQUFDLE9BQW1CLEVBQUUsRUFBRSxFQUFFO1lBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUEsdUJBQVUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVoRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzdELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBQ0QsVUFBVSxFQUFFLENBQUMsT0FBbUIsRUFBRSxFQUFFLEVBQUU7WUFDcEMsTUFBTSxPQUFPLEdBQUcsSUFBQSx1QkFBVSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQ0QsTUFBTSxFQUFFLENBQUMsSUFBZ0IsRUFBRSxFQUFFOztZQUMzQixNQUFNLE9BQU8sR0FBRyxJQUFBLHVCQUFVLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDaEUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQUEsT0FBTyxDQUFDLENBQUMsQ0FBQyxtQ0FBSSxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsVUFBVSxFQUFFLENBQUMsSUFBZ0IsRUFBRSxFQUFFO1lBQy9CLE1BQU0sT0FBTyxHQUFHLElBQUEsdUJBQVUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELE1BQU0sRUFBRSxDQUFDLElBQWdCLEVBQUUsRUFBRTtZQUMzQixNQUFNLEVBQUUsSUFBSSxLQUFpQixJQUFJLEVBQWhCLE9BQU8sVUFBSyxJQUFJLEVBQTNCLFFBQW9CLENBQU8sQ0FBQztZQUNsQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBQSxtQkFBTSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFDRCxVQUFVLEVBQUUsQ0FBQyxJQUFvQixFQUFFLEVBQUU7WUFDbkMsTUFBTSxFQUFFLElBQUksS0FBaUIsSUFBSSxFQUFoQixPQUFPLFVBQUssSUFBSSxFQUEzQixRQUFvQixDQUFPLENBQUM7WUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNqQixJQUFBLG1CQUFNLEVBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQ0QsTUFBTSxFQUFFLENBQUMsSUFBZ0IsRUFBRSxFQUFFOztZQUMzQixNQUFNLEdBQUcsR0FBRyxJQUFBLG9CQUFPLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMvQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNSLE1BQU0sT0FBTyxHQUFHLElBQUEsdUJBQVUsa0NBQU0sSUFBSSxLQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxLQUFJLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzFGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFBLE9BQU8sQ0FBQyxDQUFDLENBQUMsbUNBQUksSUFBSSxDQUFDLENBQUM7WUFDN0MsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxLQUFpQixJQUFJLEVBQWhCLE9BQU8sVUFBSyxJQUFJLEVBQW5DLFVBQTRCLENBQU8sQ0FBQztnQkFDMUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUEsbUJBQU0sRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMvRSxDQUFDO1FBQ0gsQ0FBQztRQUNELFFBQVEsRUFBRSxDQUFDLE9BQWlCLEVBQUUsRUFBRSxFQUFFO1lBQ2hDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFBLHFCQUFRLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFDRCxVQUFVLEVBQUUsQ0FBQyxPQUFpQixFQUFFLEVBQUUsRUFBRTtZQUNsQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFTLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBQ0QsU0FBUyxFQUFFLENBQUMsT0FBaUIsRUFBRSxFQUFFLEVBQUU7WUFDakMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUEsb0JBQU8sRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBUyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUNELGlCQUFpQixFQUFFLENBQUMsT0FBaUIsRUFBRSxFQUFFLEVBQUU7WUFDekMsTUFBTSxLQUFLLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMvQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUNELGdCQUFnQixFQUFFLENBQUMsT0FBaUIsRUFBRSxFQUFFLEVBQUU7WUFDeEMsTUFBTSxLQUFLLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMvQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUNELEtBQUssRUFBRSxDQUFDLE9BQWlCLEVBQUUsRUFBRSxFQUFFO1lBQzdCLE1BQU0sS0FBSyxHQUFHLElBQUEscUJBQVEsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELFNBQVMsRUFBRSxDQUFDLE9BQXNCLEVBQUUsRUFBRSxFQUFFO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUEscUJBQVEsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sVUFBVSxHQUFHLElBQUEsc0JBQVMsRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFMUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxPQUFPLEVBQUUsQ0FBQyxJQUFpQixFQUFFLEVBQUU7WUFDN0IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUEsb0JBQU8sRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUNELG1CQUFtQixFQUFFLENBQUMsSUFBb0IsRUFBRSxFQUFFO1lBQzVDLE1BQU0sRUFBRSxJQUFJLEtBQWlCLElBQUksRUFBaEIsT0FBTyxVQUFLLElBQUksRUFBM0IsUUFBb0IsQ0FBTyxDQUFDO1lBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEsbUJBQU0sRUFBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNELEtBQUs7UUFDTCxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUMxQixhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNyQyxRQUFRO0tBQ1QsQ0FBQyxDQUFDO0lBRUgsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQyJ9