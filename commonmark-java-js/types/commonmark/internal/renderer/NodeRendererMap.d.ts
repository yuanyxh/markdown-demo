import type { Node } from '@/node';
import type { NodeRenderer } from '@/renderer';
declare class NodeRendererMap {
    private readonly nodeRenderers;
    private readonly renderers;
    add(nodeRenderer: NodeRenderer): void;
    render(node: Node): void;
    beforeRoot(node: Node): void;
    afterRoot(node: Node): void;
}
export default NodeRendererMap;
