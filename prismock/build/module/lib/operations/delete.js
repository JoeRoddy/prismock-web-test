import { pipe } from '../helpers';
import { getDelegateFromField, getFieldFromRelationshipWhere, getJoinField, includes, select, where } from './find';
export function deleteMany(args, current, delegates, onChange) {
    const { toDelete, withoutDeleted } = current.getItems().reduce((accumulator, currentValue) => {
        const shouldDelete = where(args.where, current, delegates)(currentValue);
        const deleted = pipe(includes(args, current, delegates), select(args.select))(currentValue);
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
            const joinfield = getJoinField(field, delegates);
            if (!joinfield)
                return;
            const delegate = getDelegateFromField(field, delegates);
            if (joinfield.relationOnDelete === 'SetNull') {
                delegate.updateMany({
                    where: getFieldFromRelationshipWhere(item, joinfield),
                    data: {
                        [joinfield.relationFromFields[0]]: null,
                    },
                });
            }
            else if (joinfield.relationOnDelete === 'Cascade') {
                delegate.deleteMany({
                    where: getFieldFromRelationshipWhere(item, joinfield),
                });
            }
        });
    });
    return toDelete;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9vcGVyYXRpb25zL2RlbGV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRWxDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSw2QkFBNkIsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFhcEgsTUFBTSxVQUFVLFVBQVUsQ0FBQyxJQUFnQixFQUFFLE9BQWlCLEVBQUUsU0FBb0IsRUFBRSxRQUFpQztJQUNySCxNQUFNLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQzVELENBQUMsV0FBd0IsRUFBRSxZQUFrQixFQUFFLEVBQUU7UUFDL0MsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFNUYsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixPQUFPO2dCQUNMLFFBQVEsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7Z0JBQzVDLGNBQWMsRUFBRSxXQUFXLENBQUMsY0FBYzthQUMzQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU87WUFDTCxRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVE7WUFDOUIsY0FBYyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQztTQUM5RCxDQUFDO0lBQ0osQ0FBQyxFQUNELEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLENBQ3JDLENBQUM7SUFFRixRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFekIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQzlCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3JDLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTztZQUV2QixNQUFNLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFeEQsSUFBSSxTQUFTLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzdDLFFBQVEsQ0FBQyxVQUFVLENBQUM7b0JBQ2xCLEtBQUssRUFBRSw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDO29CQUNyRCxJQUFJLEVBQUU7d0JBQ0osQ0FBQyxTQUFTLENBQUMsa0JBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJO3FCQUN6QztpQkFDRixDQUFDLENBQUM7WUFDTCxDQUFDO2lCQUFNLElBQUksU0FBUyxDQUFDLGdCQUFnQixLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUNwRCxRQUFRLENBQUMsVUFBVSxDQUFDO29CQUNsQixLQUFLLEVBQUUsNkJBQTZCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQztpQkFDdEQsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDIn0=