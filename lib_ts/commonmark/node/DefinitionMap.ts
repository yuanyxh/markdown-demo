


import { java, JavaObject } from "jree";



/**
 * A map that can be used to store and look up reference definitions by a label. The labels are case-insensitive and
 * normalized, the same way as for {@link LinkReferenceDefinition} nodes.
 *
 * @param <D> the type of value
 */
export  class DefinitionMap<D> extends JavaObject {

    private readonly  type:  java.lang.Class<D> | null;
    // LinkedHashMap for determinism and to preserve document order
    private readonly  definitions:  java.util.Map<java.lang.String, D> | null = new  java.util.LinkedHashMap();

    public  constructor(type: java.lang.Class<D>| null) {
        super();
this.type = type;
    }

    public  getType():  java.lang.Class<D> | null {
        return this.type;
    }

    public  addAll(that: DefinitionMap<D>| null):  void {
        for (let entry of that.definitions.entrySet()) {
            // Note that keys are already normalized, so we can add them directly
            this.definitions.putIfAbsent(entry.getKey(), entry.getValue());
        }
    }

    /**
     * Store a new definition unless one is already in the map. If there is no definition for that label yet, return null.
     * Otherwise, return the existing definition.
     * <p>
     * The label is normalized by the definition map before storing.
     */
    public  putIfAbsent(label: java.lang.String| null, definition: D| null):  D | null {
        let  normalizedLabel: java.lang.String = Escaping.normalizeLabelContent(label);

        // spec: When there are multiple matching link reference definitions, the first is used
        return this.definitions.putIfAbsent(normalizedLabel, definition);
    }

    /**
     * Look up a definition by label. The label is normalized by the definition map before lookup.
     *
     * @return the value or null
     */
    public  get(label: java.lang.String| null):  D | null {
        let  normalizedLabel: java.lang.String = Escaping.normalizeLabelContent(label);
        return this.definitions.get(normalizedLabel);
    }

    public  keySet():  java.util.Set<java.lang.String> | null {
        return this.definitions.keySet();
    }

    public  values():  java.util.Collection<D> | null {
        return this.definitions.values();
    }
}
