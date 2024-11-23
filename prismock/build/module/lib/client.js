import dmmfJson from './dmmf.json';
import { generateDelegates } from './prismock';
export function generateClient(delegates, getData, setData) {
    // eslint-disable-next-line no-console
    console.log('Deprecation notice: generatePrismock and generatePrismockSync should be replaced with PrismockClient. See https://github.com/morintd/prismock/blob/master/docs/generate-prismock-deprecated.md');
    const client = {
        $connect: () => Promise.resolve(),
        $disconnect: () => Promise.resolve(),
        $on: () => { },
        $use: () => { },
        $executeRaw: () => Promise.resolve(0),
        $executeRawUnsafe: () => Promise.resolve(0),
        $queryRaw: () => Promise.resolve([]),
        $queryRawUnsafe: () => Promise.resolve([]),
        getData,
        setData,
        ...delegates,
    };
    return {
        ...client,
        $transaction: async (args) => {
            if (Array.isArray(args)) {
                return Promise.all(args);
            }
            return args(client);
        },
    };
}
export function createPrismock(dmmf) {
    return class Prismock {
        constructor() {
            this.generate();
        }
        reset() {
            this.generate();
        }
        generate() {
            const { delegates, setData, getData } = generateDelegates({ models: dmmf.datamodel.models });
            Object.entries({ ...delegates, setData, getData }).forEach(([key, value]) => {
                if (key in this)
                    Object.assign(this[key], value);
                else
                    Object.assign(this, { [key]: value });
            });
        }
        async $connect() {
            return Promise.resolve();
        }
        $disconnect() {
            return Promise.resolve();
        }
        $on() { }
        $use() {
            return this;
        }
        $executeRaw() {
            return Promise.resolve(0);
        }
        $executeRawUnsafe() {
            return Promise.resolve(0);
        }
        $queryRaw() {
            return Promise.resolve([]);
        }
        $queryRawUnsafe() {
            return Promise.resolve([]);
        }
        $extends() {
            return this;
        }
        async $transaction(args) {
            if (Array.isArray(args)) {
                return Promise.all(args);
            }
            return args(this);
        }
    };
}
export const PrismockClient = createPrismock(dmmfJson);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sRUFBbUIsaUJBQWlCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFjaEUsTUFBTSxVQUFVLGNBQWMsQ0FBbUIsU0FBbUMsRUFBRSxPQUFnQixFQUFFLE9BQWdCO0lBQ3RILHNDQUFzQztJQUN0QyxPQUFPLENBQUMsR0FBRyxDQUNULGdNQUFnTSxDQUNqTSxDQUFDO0lBRUYsTUFBTSxNQUFNLEdBQUc7UUFDYixRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNqQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNwQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQztRQUNiLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRSxDQUFDO1FBQ2QsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzNDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNwQyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDMUMsT0FBTztRQUNQLE9BQU87UUFDUCxHQUFHLFNBQVM7S0FDdUIsQ0FBQztJQUV0QyxPQUFPO1FBQ0wsR0FBRyxNQUFNO1FBQ1QsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUF3QixFQUFFLEVBQUU7WUFDL0MsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3hCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsQ0FBQztLQUNrQyxDQUFDO0FBQ3hDLENBQUM7QUFJRCxNQUFNLFVBQVUsY0FBYyxDQUFDLElBQXFCO0lBQ2xELE9BQU8sTUFBTSxRQUFRO1FBQ25CO1lBQ0UsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLO1lBQ0gsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFTyxRQUFRO1lBQ2QsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsaUJBQWlCLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFzQixFQUFFLENBQUMsQ0FBQztZQUU3RyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDMUUsSUFBSSxHQUFHLElBQUksSUFBSTtvQkFBRSxNQUFNLENBQUMsTUFBTSxDQUFFLElBQTZCLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7O29CQUN0RSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBUTtZQUNaLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRCxXQUFXO1lBQ1QsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELEdBQUcsS0FBSSxDQUFDO1FBRVIsSUFBSTtZQUNGLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELFdBQVc7WUFDVCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELGlCQUFpQjtZQUNmLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsU0FBUztZQUNQLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsZUFBZTtZQUNiLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsUUFBUTtZQUNOLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBUztZQUMxQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixDQUFDO0tBQytDLENBQUM7QUFDckQsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMifQ==