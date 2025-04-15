import type { Node } from '@/node';
import type { TextContentNodeRendererContext } from './interfaces/TextContentNodeRendererContext';
import type { NodeRenderer } from '../interfaces/NodeRenderer';
import { AbstractVisitor } from '@/node';
/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 *
 * 渲染所有核心节点的默认节点渲染器（按节点渲染器的顺序排在最后）
 */
declare class CoreTextContentNodeRenderer extends AbstractVisitor implements NodeRenderer {
    protected readonly context: TextContentNodeRendererContext;
    private readonly textContent;
    private listHolder;
    constructor(context: TextContentNodeRendererContext);
    beforeRoot(rootNode: Node): void;
    afterRoot(rootNode: Node): void;
    getNodeTypes(): Set<typeof Node>;
    render(node: Node): void;
    visit(node: Node): void;
    protected visitChildren(parent: Node): void;
    private writeText;
    private writeLink;
    private stripNewlines;
    private static stripTrailingNewline;
}
export default CoreTextContentNodeRenderer;
