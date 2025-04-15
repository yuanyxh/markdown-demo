import type { Node } from '@/node';
import type { NodeRenderer } from '../interfaces/NodeRenderer';
import type { MarkdownNodeRendererContext } from './interfaces/MarkdownNodeRendererContext';
import { BulletList, OrderedList, SoftLineBreak, HardLineBreak, AbstractVisitor } from '@/node';
declare class ListHolder {
    readonly parent: ListHolder;
    constructor(parent: ListHolder);
}
declare class BulletListHolder extends ListHolder {
    readonly marker: string;
    constructor(parent: ListHolder, bulletList: BulletList);
}
declare class OrderedListHolder extends ListHolder {
    readonly delimiter: string;
    number: number;
    constructor(parent: ListHolder, orderedList: OrderedList);
}
declare class LineBreakVisitor extends AbstractVisitor {
    private lineBreak;
    hasLineBreak(): boolean;
    visit(lineBreak: SoftLineBreak | HardLineBreak): void;
}
/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 * <p>
 * Note that while sometimes it would be easier to record what kind of syntax was used on parsing (e.g. ATX vs Setext
 * heading), this renderer is intended to also work for documents that were created by directly creating
 * {@link Node Nodes} instead. So in order to support that, it sometimes needs to do a bit more work.
 */
declare class CoreMarkdownNodeRenderer extends AbstractVisitor implements NodeRenderer {
    private readonly textEscape;
    private readonly textEscapeInHeading;
    private readonly linkDestinationNeedsAngleBrackets;
    private readonly linkDestinationEscapeInAngleBrackets;
    private readonly linkTitleEscapeInQuotes;
    private readonly orderedListMarkerPattern;
    protected readonly context: MarkdownNodeRendererContext;
    private readonly writer;
    /**
     * If we're currently within a {@link BulletList} or {@link OrderedList}, this keeps the context of that list.
     * It has a parent field so that it can represent a stack (for nested lists).
     */
    private listHolder;
    constructor(context: MarkdownNodeRendererContext);
    beforeRoot(rootNode: Node): void;
    afterRoot(rootNode: Node): void;
    getNodeTypes(): Set<typeof Node>;
    render(node: Node): void;
    visit(node: Node): void;
    protected visitChildren(parent: Node): void;
    private static findMaxRunLength;
    private static contains;
    private static repeat;
    private static getLines;
    private writeLinkLike;
    static ListHolder: typeof ListHolder;
    static BulletListHolder: typeof BulletListHolder;
    static OrderedListHolder: typeof OrderedListHolder;
    /**
     * Visits nodes to check if there are any soft or hard line breaks.
     */
    static LineBreakVisitor: typeof LineBreakVisitor;
}
export default CoreMarkdownNodeRenderer;
