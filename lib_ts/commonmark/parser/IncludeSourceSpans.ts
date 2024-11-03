
import { java, S } from "jree";

 class  IncludeSourceSpans extends java.lang.Enum<IncludeSourceSpans> {
    /**
     * Do not include source spans.
     */
    public static readonly NONE: IncludeSourceSpans = new class extends IncludeSourceSpans {
}(S`NONE`, 0);
    /**
     * Include source spans on {@link org.commonmark.node.Block} nodes.
     */
    public static readonly BLOCKS: IncludeSourceSpans = new class extends IncludeSourceSpans {
}(S`BLOCKS`, 1);
    /**
     * Include source spans on block nodes and inline nodes.
     */
    public static readonly BLOCKS_AND_INLINES: IncludeSourceSpans = new class extends IncludeSourceSpans {
}(S`BLOCKS_AND_INLINES`, 2),
}
