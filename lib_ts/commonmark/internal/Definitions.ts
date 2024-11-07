import { DefinitionMap } from "../node";

class Definitions {
  private readonly definitionsByType = new Map<any, DefinitionMap<unknown>>();

  public addDefinitions<D>(definitionMap: DefinitionMap<D>) {
    const existingMap = this.getMap(definitionMap.getType());

    if (!existingMap) {
      this.definitionsByType.set(definitionMap.getType(), definitionMap);
    } else {
      existingMap.addAll(definitionMap);
    }
  }

  public getDefinition<V extends abstract new (...args: any) => any>(
    type: V,
    label: string
  ): InstanceType<V> | null {
    let definitionMap = this.getMap(type);

    if (!definitionMap) {
      return null;
    }

    return (definitionMap.get(label) as any) || null;
  }

  private getMap<V>(type: V): DefinitionMap<V> | null {
    // noinspection unchecked
    return (this.definitionsByType.get(type) as DefinitionMap<V>) || null;
  }
}

export default Definitions;
