import type { DefinitionMap } from '@/node';
declare class Definitions {
    private readonly definitionsByType;
    addDefinitions<D extends abstract new (...args: any) => any>(definitionMap: DefinitionMap<InstanceType<D>>): void;
    getDefinition<V extends abstract new (...args: any) => any>(type: V, label: string): InstanceType<V> | null;
    private getMap;
}
export default Definitions;
