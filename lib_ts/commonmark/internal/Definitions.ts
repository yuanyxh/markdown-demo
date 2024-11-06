class Definitions {
  private readonly definitionsByType: java.util.Map<
    java.lang.Class<unknown>,
    DefinitionMap<unknown>
  > | null = new java.util.HashMap();

  public addDefinitions<D>(definitionMap: DefinitionMap<D> | null): void {
    let existingMap = this.getMap(definitionMap.getType());
    if (existingMap === null) {
      this.definitionsByType.put(definitionMap.getType(), definitionMap);
    } else {
      existingMap.addAll(definitionMap);
    }
  }

  public getDefinition<V>(
    type: java.lang.Class<V> | null,
    label: string | null
  ): V | null {
    let definitionMap = this.getMap(type);
    if (definitionMap === null) {
      return null;
    }
    return definitionMap.get(label);
  }

  private getMap<V>(type: java.lang.Class<V> | null): DefinitionMap<V> | null {
    //noinspection unchecked
    return this.definitionsByType.get(type) as DefinitionMap<V>;
  }
}

export default Definitions;
