"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMany = deleteMany;
const helpers_1 = require("../helpers");
const find_1 = require("./find");
function deleteMany(args, current, delegates, onChange) {
    const { toDelete, withoutDeleted } = current.getItems().reduce((accumulator, currentValue) => {
        const shouldDelete = (0, find_1.where)(args.where, current, delegates)(currentValue);
        const deleted = (0, helpers_1.pipe)((0, find_1.includes)(args, current, delegates), (0, find_1.select)(args.select))(currentValue);
        if (shouldDelete) {
            return {
                toDelete: [...accumulator.toDelete, deleted],
                withoutDeleted: accumulator.withoutDeleted,
            };
        }
        return {
            toDelete: accumulator.toDelete,
            withoutDeleted: [...accumulator.withoutDeleted, currentValue],
        };
    }, { toDelete: [], withoutDeleted: [] });
    onChange(withoutDeleted);
    toDelete.forEach((item) => {
        current.model.fields.forEach((field) => {
            const joinfield = (0, find_1.getJoinField)(field, delegates);
            if (!joinfield)
                return;
            const delegate = (0, find_1.getDelegateFromField)(field, delegates);
            if (joinfield.relationOnDelete === 'SetNull') {
                delegate.updateMany({
                    where: (0, find_1.getFieldFromRelationshipWhere)(item, joinfield),
                    data: {
                        [joinfield.relationFromFields[0]]: null,
                    },
                });
            }
            else if (joinfield.relationOnDelete === 'Cascade') {
                delegate.deleteMany({
                    where: (0, find_1.getFieldFromRelationshipWhere)(item, joinfield),
                });
            }
        });
    });
    return toDelete;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9vcGVyYXRpb25zL2RlbGV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWtCQSxnQ0E4Q0M7QUE3REQsd0NBQWtDO0FBRWxDLGlDQUFvSDtBQWFwSCxTQUFnQixVQUFVLENBQUMsSUFBZ0IsRUFBRSxPQUFpQixFQUFFLFNBQW9CLEVBQUUsUUFBaUM7SUFDckgsTUFBTSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUM1RCxDQUFDLFdBQXdCLEVBQUUsWUFBa0IsRUFBRSxFQUFFO1FBQy9DLE1BQU0sWUFBWSxHQUFHLElBQUEsWUFBSyxFQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sT0FBTyxHQUFHLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBUSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUUsSUFBQSxhQUFNLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFNUYsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixPQUFPO2dCQUNMLFFBQVEsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7Z0JBQzVDLGNBQWMsRUFBRSxXQUFXLENBQUMsY0FBYzthQUMzQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU87WUFDTCxRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVE7WUFDOUIsY0FBYyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQztTQUM5RCxDQUFDO0lBQ0osQ0FBQyxFQUNELEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLENBQ3JDLENBQUM7SUFFRixRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFekIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQzlCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3JDLE1BQU0sU0FBUyxHQUFHLElBQUEsbUJBQVksRUFBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTztZQUV2QixNQUFNLFFBQVEsR0FBRyxJQUFBLDJCQUFvQixFQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV4RCxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDN0MsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDbEIsS0FBSyxFQUFFLElBQUEsb0NBQTZCLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQztvQkFDckQsSUFBSSxFQUFFO3dCQUNKLENBQUMsU0FBUyxDQUFDLGtCQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSTtxQkFDekM7aUJBQ0YsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDcEQsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDbEIsS0FBSyxFQUFFLElBQUEsb0NBQTZCLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQztpQkFDdEQsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDIn0=