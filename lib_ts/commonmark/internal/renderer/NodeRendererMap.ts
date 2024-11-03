


import { java, JavaObject } from "jree";



export  class NodeRendererMap extends JavaObject {

    private readonly  nodeRenderers:  java.util.List<NodeRenderer> | null = new  java.util.ArrayList();
    private readonly  renderers:  java.util.Map<java.lang.Class< Node>, NodeRenderer> | null = new  java.util.HashMap(32);

    public  add(nodeRenderer: NodeRenderer| null):  void {
        this.nodeRenderers.add(nodeRenderer);
        for (let nodeType of nodeRenderer.getNodeTypes()) {
            // The first node renderer for a node type "wins".
            this.renderers.putIfAbsent(nodeType, nodeRenderer);
        }
    }

    public  render(node: Node| null):  void {
        let  nodeRenderer  = this.renderers.get(node.getClass());
        if (nodeRenderer !== null) {
            nodeRenderer.render(node);
        }
    }

    public  beforeRoot(node: Node| null):  void {
        this.nodeRenderers.forEach(r => r.beforeRoot(node));
    }

    public  afterRoot(node: Node| null):  void {
        this.nodeRenderers.forEach(r => r.afterRoot(node));
    }
}
