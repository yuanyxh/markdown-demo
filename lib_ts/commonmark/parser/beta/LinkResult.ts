


import { java } from "jree";



/**
 * What to do with a link/image processed by {@link LinkProcessor}.
 */
 abstract class LinkResult {
    /**
     * Link not handled by processor.
     */
    staticprotected abstract  none():  LinkResult {
        return null;
    }

    /**
     * Wrap the link text in a node. This is the normal behavior for links, e.g. for this:
     * <pre><code>
     * [my *text*](destination)
     * </code></pre>
     * The text is {@code my *text*}, a text node and emphasis. The text is wrapped in a
     * {@link org.commonmark.node.Link} node, which means the text is added as child nodes to it.
     *
     * @param node     the node to which the link text nodes will be added as child nodes
     * @param position the position to continue parsing from
     */
    staticprotected abstract  wrapTextIn(node: Node| null, position: Position| null):  LinkResult {
        return new  LinkResultImpl(LinkResultImpl.Type.WRAP, node, position);
    }

    /**
     * Replace the link with a node. E.g. for this:
     * <pre><code>
     * [^foo]
     * </code></pre>
     * The processor could decide to create a {@code FootnoteReference} node instead which replaces the link.
     *
     * @param node     the node to replace the link with
     * @param position the position to continue parsing from
     */
    staticprotected abstract  replaceWith(node: Node| null, position: Position| null):  LinkResult {
        return new  LinkResultImpl(LinkResultImpl.Type.REPLACE, node, position);
    }

    /**
     * If a {@link LinkInfo#marker()} is present, include it in processing (i.e. treat it the same way as the brackets).
     */
    protected abstract  includeMarker(): LinkResult;
}
