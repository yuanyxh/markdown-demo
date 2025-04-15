/**
 * A map that can be used to store and look up reference definitions by a label. The labels are case-insensitive and
 * normalized, the same way as for {@link LinkReferenceDefinition} nodes.
 *
 * @param <D> the type of value
 */
declare class DefinitionMap<D extends abstract new (...args: any) => any> {
    private readonly type;
    private readonly definitions;
    constructor(type: D);
    getType(): D;
    addAll(that: DefinitionMap<InstanceType<D>>): void;
    /**
     * Store a new definition unless one is already in the map. If there is no definition for that label yet, return null.
     * Otherwise, return the existing definition.
     * <p>
     * The label is normalized by the definition map before storing.
     */
    putIfAbsent(label: string, definition: InstanceType<D>): InstanceType<D>;
    /**
     * Look up a definition by label. The label is normalized by the definition map before lookup.
     *
     * @return the value or null
     */
    get(label: string): InstanceType<D> | undefined;
    keySet(): string[];
    values(): InstanceType<D>[];
}
export default DefinitionMap;
