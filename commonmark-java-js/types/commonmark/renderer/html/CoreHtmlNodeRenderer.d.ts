import type { Node } from '@/node';
import type { HtmlNodeRendererContext } from './interfaces/HtmlNodeRendererContext';
import type { NodeRenderer } from '../interfaces/NodeRenderer';
import { Text, SoftLineBreak, HardLineBreak, AbstractVisitor } from '@/node';
declare class AltTextVisitor extends AbstractVisitor {
    private readonly sb;
    getAltText(): string;
    visit(node: Text | SoftLineBreak | HardLineBreak): void;
}
/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 */
declare class CoreHtmlNodeRenderer extends AbstractVisitor implements NodeRenderer {
    protected readonly context: HtmlNodeRendererContext;
    private readonly html;
    constructor(context: HtmlNodeRendererContext);
    beforeRoot(rootNode: Node): void;
    afterRoot(rootNode: Node): void;
    getNodeTypes(): Set<typeof Node>;
    render(node: Node): void;
    visit(node: Node): void;
    protected visitChildren(parent: Node): void;
    private renderCodeBlock;
    private renderListBlock;
    private isInTightList;
    private getAttrs;
    static AltTextVisitor: typeof AltTextVisitor;
}
export default CoreHtmlNodeRenderer;
