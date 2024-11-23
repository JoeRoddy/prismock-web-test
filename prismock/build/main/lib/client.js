"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismockClient = void 0;
exports.generateClient = generateClient;
exports.createPrismock = createPrismock;
const dmmf_json_1 = __importDefault(require("./dmmf.json"));
const prismock_1 = require("./prismock");
function generateClient(delegates, getData, setData) {
    // eslint-disable-next-line no-console
    console.log('Deprecation notice: generatePrismock and generatePrismockSync should be replaced with PrismockClient. See https://github.com/morintd/prismock/blob/master/docs/generate-prismock-deprecated.md');
    const client = Object.assign({ $connect: () => Promise.resolve(), $disconnect: () => Promise.resolve(), $on: () => { }, $use: () => { }, $executeRaw: () => Promise.resolve(0), $executeRawUnsafe: () => Promise.resolve(0), $queryRaw: () => Promise.resolve([]), $queryRawUnsafe: () => Promise.resolve([]), getData,
        setData }, delegates);
    return Object.assign(Object.assign({}, client), { $transaction: async (args) => {
            if (Array.isArray(args)) {
                return Promise.all(args);
            }
            return args(client);
        } });
}
function createPrismock(dmmf) {
    return class Prismock {
        constructor() {
            this.generate();
        }
        reset() {
            this.generate();
        }
        generate() {
            const { delegates, setData, getData } = (0, prismock_1.generateDelegates)({ models: dmmf.datamodel.models });
            Object.entries(Object.assign(Object.assign({}, delegates), { setData, getData })).forEach(([key, value]) => {
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
exports.PrismockClient = createPrismock(dmmf_json_1.default);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBa0JBLHdDQThCQztBQUlELHdDQTZEQztBQTlHRCw0REFBbUM7QUFDbkMseUNBQWdFO0FBY2hFLFNBQWdCLGNBQWMsQ0FBbUIsU0FBbUMsRUFBRSxPQUFnQixFQUFFLE9BQWdCO0lBQ3RILHNDQUFzQztJQUN0QyxPQUFPLENBQUMsR0FBRyxDQUNULGdNQUFnTSxDQUNqTSxDQUFDO0lBRUYsTUFBTSxNQUFNLEdBQUcsZ0JBQ2IsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFDakMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFDcEMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFFLENBQUMsRUFDYixJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxFQUNkLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUNyQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUMzQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFDcEMsZUFBZSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQzFDLE9BQU87UUFDUCxPQUFPLElBQ0osU0FBUyxDQUN1QixDQUFDO0lBRXRDLE9BQU8sZ0NBQ0YsTUFBTSxLQUNULFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBd0IsRUFBRSxFQUFFO1lBQy9DLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUN4QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RCLENBQUMsR0FDa0MsQ0FBQztBQUN4QyxDQUFDO0FBSUQsU0FBZ0IsY0FBYyxDQUFDLElBQXFCO0lBQ2xELE9BQU8sTUFBTSxRQUFRO1FBQ25CO1lBQ0UsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLO1lBQ0gsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFTyxRQUFRO1lBQ2QsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBQSw0QkFBaUIsRUFBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQXNCLEVBQUUsQ0FBQyxDQUFDO1lBRTdHLE1BQU0sQ0FBQyxPQUFPLGlDQUFNLFNBQVMsS0FBRSxPQUFPLEVBQUUsT0FBTyxJQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDMUUsSUFBSSxHQUFHLElBQUksSUFBSTtvQkFBRSxNQUFNLENBQUMsTUFBTSxDQUFFLElBQTZCLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7O29CQUN0RSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBUTtZQUNaLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRCxXQUFXO1lBQ1QsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELEdBQUcsS0FBSSxDQUFDO1FBRVIsSUFBSTtZQUNGLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELFdBQVc7WUFDVCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELGlCQUFpQjtZQUNmLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsU0FBUztZQUNQLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsZUFBZTtZQUNiLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsUUFBUTtZQUNOLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBUztZQUMxQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixDQUFDO0tBQytDLENBQUM7QUFDckQsQ0FBQztBQUVZLFFBQUEsY0FBYyxHQUFHLGNBQWMsQ0FBQyxtQkFBUSxDQUFDLENBQUMifQ==