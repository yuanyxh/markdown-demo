


import { java, JavaObject, type int, S } from "jree";



/**
 * Renders nodes to Markdown (CommonMark syntax); use {@link #builder()} to create a renderer.
 * <p>
 * Note that it doesn't currently preserve the exact syntax of the original input Markdown (if any):
 * <ul>
 *     <li>Headings are output as ATX headings if possible (multi-line headings need Setext headings)</li>
 *     <li>Links are always rendered as inline links (no support for reference links yet)</li>
 *     <li>Escaping might be over-eager, e.g. a plain {@code *} might be escaped
 *     even though it doesn't need to be in that particular context</li>
 *     <li>Leading whitespace in paragraphs is not preserved</li>
 * </ul>
 * However, it should produce Markdown that is semantically equivalent to the input, i.e. if the Markdown was parsed
 * again and compared against the original AST, it should be the same (minus bugs).
 */
export  class MarkdownRenderer extends JavaObject implements Renderer {

    private readonly  nodeRendererFactories:  java.util.List<MarkdownNodeRendererFactory> | null;

    private  constructor(builder: MarkdownRenderer.Builder| null) {
        super();
this.nodeRendererFactories = new  java.util.ArrayList(builder.nodeRendererFactories.size() + 1);
        this.nodeRendererFactories.addAll(builder.nodeRendererFactories);
        // Add as last. This means clients can override the rendering of core nodes if they want.
        this.nodeRendererFactories.add(new  class extends MarkdownNodeRendererFactory {
            public  create(context: MarkdownNodeRendererContext| null):  NodeRenderer | null {
                return new  CoreMarkdownNodeRenderer(context);
            }

            public  getSpecialCharacters():  java.util.Set<java.lang.Character> | null {
                return java.util.Set.of();
            }
        }());
    }

    /**
     * Create a new builder for configuring a {@link MarkdownRenderer}.
     *
     * @return a builder
     */
    public static  builder():  MarkdownRenderer.Builder | null {
        return new  MarkdownRenderer.Builder();
    }

    public  render(node: Node| null):  java.lang.String | null;

    public  render(node: Node| null, output: java.lang.Appendable| null):  void;
public render(...args: unknown[]):  java.lang.String | null |  void {
		switch (args.length) {
			case 1: {
				const [node] = args as [Node];


        let  sb: java.lang.StringBuilder = new  java.lang.StringBuilder();
        this.render(node, sb);
        return sb.toString();
    

				break;
			}

			case 2: {
				const [node, output] = args as [Node, java.lang.Appendable];


        let  context: MarkdownRenderer.RendererContext = new  RendererContext(new  MarkdownWriter(output));
        context.render(node);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /**
     * Builder for configuring a {@link MarkdownRenderer}. See methods for default configuration.
     */
    public static Builder =  class Builder extends JavaObject {

        private readonly  nodeRendererFactories:  java.util.List<MarkdownNodeRendererFactory> | null = new  java.util.ArrayList();

        /**
         * @return the configured {@link MarkdownRenderer}
         */
        public  build():  MarkdownRenderer | null {
            return new  MarkdownRenderer(this);
        }

        /**
         * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
         * of node types or define rendering for custom node types.
         * <p>
         * If multiple node renderers for the same node type are created, the one from the factory that was added first
         * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
         *
         * @param nodeRendererFactory the factory for creating a node renderer
         * @return {@code this}
         */
        public  nodeRendererFactory(nodeRendererFactory: MarkdownNodeRendererFactory| null):  MarkdownRenderer.Builder | null {
            this.nodeRendererFactories.add(nodeRendererFactory);
            return this;
        }

        /**
         * @param extensions extensions to use on this renderer
         * @return {@code this}
         */
        public  extensions(extensions: java.lang.Iterable< java.security.cert.Extension>| null):  MarkdownRenderer.Builder | null {
            for (let extension of extensions) {
                if (extension instanceof MarkdownRendererExtension) {
                    let  markdownRendererExtension: Builder.MarkdownRendererExtension =  extension as MarkdownRendererExtension;
                    markdownRendererExtension.extend(this);
                }
            }
            return this;
        }
    };


    public RendererContext = (($outer) => {
return  class RendererContext extends JavaObject implements MarkdownNodeRendererContext {
        private readonly  writer:  MarkdownWriter | null;
        private readonly  nodeRendererMap:  NodeRendererMap | null = new  NodeRendererMap();
        private readonly  additionalTextEscapes:  java.util.Set<java.lang.Character> | null;

        private  constructor(writer: MarkdownWriter| null) {
            // Set fields that are used by interface
            super();
this.writer = writer;
            let  escapes: java.util.Set<java.lang.Character> = new  java.util.HashSet<java.lang.Character>();
            for (let factory of $outer.nodeRendererFactories) {
                escapes.addAll(factory.getSpecialCharacters());
            }
            this.additionalTextEscapes = java.util.Collections.unmodifiableSet(escapes);

            // The first node renderer for a node type "wins".
            for (let  i: int = $outer.nodeRendererFactories.size() - 1; i >= 0; i--) {
                let  nodeRendererFactory: MarkdownNodeRendererFactory = $outer.nodeRendererFactories.get(i);
                // Pass in this as context here, which uses the fields set above
                let  nodeRenderer: NodeRenderer = nodeRendererFactory.create(this);
                this.nodeRendererMap.add(nodeRenderer);
            }
        }

        public  getWriter():  MarkdownWriter | null {
            return this.writer;
        }

        public  render(node: Node| null):  void {
            this.nodeRendererMap.render(node);
        }

        public  getSpecialCharacters():  java.util.Set<java.lang.Character> | null {
            return this.additionalTextEscapes;
        }
    }
})(this);

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace MarkdownRenderer {
	export type Builder = InstanceType<typeof MarkdownRenderer.Builder>;
	export  interface MarkdownRendererExtension extends java.security.cert.Extension {

        /**
         * Extend Markdown rendering, usually by registering custom node renderers using {@link Builder#nodeRendererFactory}.
         *
         * @param rendererBuilder the renderer builder to extend
         */
          extend(rendererBuilder: MarkdownRenderer.Builder| null): void;
    }

	export type RendererContext = InstanceType<MarkdownRenderer["RendererContext"]>;
}


