


import { java, JavaObject } from "jree";



/**
 * Utility class for working with multiple {@link Node}s.
 *
 * @since 0.16.0
 */
export  class Nodes extends JavaObject {

    private  constructor() {
    super();
}

    /**
     * The nodes between (not including) start and end.
     */
    public static  between(start: Node| null, end: Node| null):  java.lang.Iterable<Node> | null {
        return new  Nodes.NodeIterable(start.getNext(), end);
    }

    public static NodeIterable =  class NodeIterable extends JavaObject implements java.lang.Iterable<Node> {

        private readonly  first:  Node | null;
        private readonly  end:  Node | null;

        private  constructor(first: Node| null, end: Node| null) {
            super();
this.first = first;
            this.end = end;
        }

        public  iterator():  java.util.Iterator<Node> | null {
            return new  Nodes.NodeIterator(this.first, this.end);
        }
    };


    public static NodeIterator =  class NodeIterator extends JavaObject implements java.util.Iterator<Node> {

        private  node:  Node | null;
        private readonly  end:  Node | null;

        private  constructor(first: Node| null, end: Node| null) {
            super();
this.node = first;
            this.end = end;
        }

        public  hasNext():  boolean {
            return this.node !== null && this.node !== this.end;
        }

        public  next():  Node | null {
            let  result: Node = this.node;
            this.node = this.node.getNext();
            return result;
        }

        public  remove():  void {
            throw new  java.lang.UnsupportedOperationException("remove");
        }
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Nodes {
	export type NodeIterable = InstanceType<typeof Nodes.NodeIterable>;
	export type NodeIterator = InstanceType<typeof Nodes.NodeIterator>;
}



