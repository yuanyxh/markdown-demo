import type Node from '../abstracts/Node';
import SourceSpan from './SourceSpan';
/**
 * A list of source spans that can be added to. Takes care of merging adjacent source spans.
 *
 * @since 0.16.0
 */
declare class SourceSpans {
    private sourceSpans;
    getSourceSpans(): SourceSpan[];
    addAllFrom(nodes: Node[]): void;
    addAll(other: SourceSpan[]): void;
    static empty(): SourceSpans;
}
export default SourceSpans;
