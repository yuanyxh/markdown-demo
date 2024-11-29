import { Escaping } from "../../internal";

/**
 * A map that can be used to store and look up reference definitions by a label. The labels are case-insensitive and
 * normalized, the same way as for {@link LinkReferenceDefinition} nodes.
 *
 * @param <D> the type of value
 */
class DefinitionMap<D extends abstract new (...args: any) => any> {
  private readonly type: D;
  // LinkedHashMap for determinism and to preserve document order
  private readonly definitions = new Map<string, InstanceType<D>>();

  public constructor(type: D) {
    this.type = type;
  }

  public getType(): D {
    return this.type;
  }

  public addAll(that: DefinitionMap<InstanceType<D>>): void {
    for (const entry of that.definitions) {
      // Note that keys are already normalized, so we can add them directly
      if (!this.definitions.has(entry[0])) {
        this.definitions.set(entry[0], entry[1]);
      }
    }
  }

  /**
   * Store a new definition unless one is already in the map. If there is no definition for that label yet, return null.
   * Otherwise, return the existing definition.
   * <p>
   * The label is normalized by the definition map before storing.
   */
  public putIfAbsent(
    label: string,
    definition: InstanceType<D>
  ): InstanceType<D> {
    const normalizedLabel: string = Escaping.normalizeLabelContent(label);

    // spec: When there are multiple matching link reference definitions, the first is used
    if (this.definitions.has(normalizedLabel)) {
      return this.definitions.get(normalizedLabel)!;
    }

    this.definitions.set(normalizedLabel, definition);

    return definition;
  }

  /**
   * Look up a definition by label. The label is normalized by the definition map before lookup.
   *
   * @return the value or null
   */
  public get(label: string): InstanceType<D> | undefined {
    const normalizedLabel: string = Escaping.normalizeLabelContent(label);

    return this.definitions.get(normalizedLabel);
  }

  public keySet(): Set<string> {
    return new Set(this.definitions.keys());
  }

  public values(): InstanceType<D>[] {
    return Array.from(this.definitions.values());
  }
}

export default DefinitionMap;
