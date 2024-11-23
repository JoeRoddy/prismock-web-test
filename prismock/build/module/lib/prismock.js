import { generateDelegate } from './delegate';
import { camelize, omit } from './helpers';
import { isAutoIncrement } from './operations';
export function generateDelegates(options) {
    const models = options.models ?? [];
    const data = {};
    const properties = {};
    const delegates = {};
    function getData() {
        return data;
    }
    function setData(d) {
        // eslint-disable-next-line no-console
        console.log('Deprecation notice: setData will be removed in a future version and should not be used anymore. Please use a mix of "reset" and create/createMany to achieve the same result');
        Object.assign(data, d);
        Object.assign(properties, Object.entries(d).reduce((accumulator, [currentKey]) => {
            const model = models.find((m) => camelize(m.name) === currentKey);
            return {
                ...accumulator,
                [currentKey]: {
                    increment: model.fields.reduce((propertiesAccumulator, currentField) => {
                        if (isAutoIncrement(currentField)) {
                            return { ...propertiesAccumulator, [currentField.name]: d[currentKey].length };
                        }
                        return propertiesAccumulator;
                    }, {}),
                },
            };
        }, {}));
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
            [delegateKey]: omit(delegateValue, ['model', 'properties', 'getItems']),
        };
    }, {});
    return { delegates: clientDelegates, getData, setData };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpc21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3ByaXNtb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBZ0MsZ0JBQWdCLEVBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEYsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQVcvQyxNQUFNLFVBQVUsaUJBQWlCLENBQUMsT0FBb0I7SUFDcEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7SUFDcEMsTUFBTSxJQUFJLEdBQVMsRUFBRSxDQUFDO0lBQ3RCLE1BQU0sVUFBVSxHQUFlLEVBQUUsQ0FBQztJQUNsQyxNQUFNLFNBQVMsR0FBYyxFQUFFLENBQUM7SUFFaEMsU0FBUyxPQUFPO1FBQ2QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxPQUFPLENBQUMsQ0FBTztRQUN0QixzQ0FBc0M7UUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FDVCw4S0FBOEssQ0FDL0ssQ0FBQztRQUVGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxNQUFNLENBQ1gsVUFBVSxFQUNWLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRTtZQUNyRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsQ0FBZSxDQUFDO1lBQ2hGLE9BQU87Z0JBQ0wsR0FBRyxXQUFXO2dCQUNkLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ1osU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMscUJBQTZDLEVBQUUsWUFBWSxFQUFFLEVBQUU7d0JBQzdGLElBQUksZUFBZSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7NEJBQ2xDLE9BQU8sRUFBRSxHQUFHLHFCQUFxQixFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDakYsQ0FBQzt3QkFDRCxPQUFPLHFCQUFxQixDQUFDO29CQUMvQixDQUFDLEVBQUUsRUFBRSxDQUFDO2lCQUNQO2FBQ0YsQ0FBQztRQUNKLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDUCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUN2QixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEIsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHO1lBQ2pCLFNBQVMsRUFBRSxFQUFFO1NBQ2QsQ0FBQztRQUVGLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQ3ZCLENBQUMsSUFBSSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUMzRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUM7U0FDSCxDQUFDLENBQUM7SUFDTCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFUCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFO1FBQ3JHLE9BQU87WUFDTCxHQUFHLFdBQVc7WUFDZCxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFhO1NBQ3BGLENBQUM7SUFDSixDQUFDLEVBQUUsRUFBZSxDQUFDLENBQUM7SUFFcEIsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQzFELENBQUMifQ==