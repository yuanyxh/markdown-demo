
import { java, S } from "jree";

 class  LineBreakRendering extends java.lang.Enum<LineBreakRendering> {
    /**
     * Strip all line breaks within blocks and between blocks, resulting in all the text in a single line.
     */
    public static readonly STRIP: LineBreakRendering = new class extends LineBreakRendering {
}(S`STRIP`, 0);
    /**
     * Use single line breaks between blocks, not a blank line (also render all lists as tight).
     */
    public static readonly COMPACT: LineBreakRendering = new class extends LineBreakRendering {
}(S`COMPACT`, 1);
    /**
     * Separate blocks by a blank line (and respect tight vs loose lists).
     */
    public static readonly SEPARATE_BLOCKS: LineBreakRendering = new class extends LineBreakRendering {
}(S`SEPARATE_BLOCKS`, 2),
}
