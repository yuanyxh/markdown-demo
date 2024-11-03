


import { java, JavaObject, S } from "jree";



/**
 * Renders nodes to plain text content with minimal markup-like additions.
 */
export  class TextContentRenderer extends JavaObject implements Renderer {

    private readonly  lineBreakRendering:  LineBreakRendering | null;

    private readonly  nodeRendererFactories:  java.util.List<TextContentNodeRendererFactory> | null;

    private  constructor(builder: TextContentRenderer.Builder| null) {
        super();
this.lineBreakRendering = builder.lineBreakRendering;

        this.nodeRendererFactories = new  java.util.ArrayList(builder.nodeRendererFactories.size() + 1);
        this.nodeRendererFactories.addAll(builder.nodeRendererFactories);
        // Add as last. This means clients can override the rendering of core nodes if they want.
        this.nodeRendererFactories.add(new  class extends TextContentNodeRendererFactory {
            public  create(context: TextContentNodeRendererContext| null):  NodeRenderer | null {
                return new  CoreTextContentNodeRenderer(context);
            }
        }());
    }

    /**
     * Create a new builder for configuring a {@link TextContentRenderer}.
     *
     * @return a builder
     */
    public static  builder():  TextContentRenderer.Builder | null {
        return new  TextContentRenderer.Builder();
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


        let  context: TextContentRenderer.RendererContext = new  RendererContext(new  TextContentWriter(output, this.lineBreakRendering));
        context.render(node);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /**
     * Builder for configuring a {@link TextContentRenderer}. See methods for default configuration.
     */
    public static Builder =  class Builder extends JavaObject {

        private  nodeRendererFactories:  java.util.List<TextContentNodeRendererFactory> | null = new  java.util.ArrayList();
        private  lineBreakRendering:  LineBreakRendering | null = LineBreakRendering.COMPACT;

        /**
         * @return the configured {@link TextContentRenderer}
         */
        public  build():  TextContentRenderer | null {
            return new  TextContentRenderer(this);
        }

        /**
         * Configure how line breaks (newlines) are rendered, see {@link LineBreakRendering}.
         * The default is {@link LineBreakRendering#COMPACT}.
         *
         * @param lineBreakRendering the mode to use
         * @return {@code this}
         */
        public  lineBreakRendering(lineBreakRendering: LineBreakRendering| null):  TextContentRenderer.Builder | null {
            this.lineBreakRendering = lineBreakRendering;
            return this;
        }

        /**
         * Set the value of flag for stripping new lines.
         *
         * @param stripNewlines true for stripping new lines and render text as "single line",
         *                      false for keeping all line breaks
         * @return {@code this}
         * @deprecated Use {@link #lineBreakRendering(LineBreakRendering)} with {@link LineBreakRendering#STRIP} instead
         */
        public  stripNewlines(stripNewlines: boolean):  TextContentRenderer.Builder | null {
            this.lineBreakRendering = stripNewlines ? LineBreakRendering.STRIP : LineBreakRendering.COMPACT;
            return this;
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
        public  nodeRendererFactory(nodeRendererFactory: TextContentNodeRendererFactory| null):  TextContentRenderer.Builder | null {
            this.nodeRendererFactories.add(nodeRendererFactory);
            return this;
        }

        /**
         * @param extensions extensions to use on this text content renderer
         * @return {@code this}
         */
        public  extensions(extensions: java.lang.Iterable< java.security.cert.Extension>| null):  TextContentRenderer.Builder | null {
            for (let extension of extensions) {
                if (extension instanceof TextContentRenderer.TextContentRendererExtension) {
                    let  textContentRendererExtension: TextContentRenderer.TextContentRendererExtension =
                             extension as TextContentRenderer.TextContentRendererExtension;
                    textContentRendererExtension.extend(this);
                }
            }
            return this;
        }
    };


    public RendererContext = (($outer) => {
return  class RendererContext extends JavaObject implements TextContentNodeRendererContext {
        private readonly  textContentWriter:  TextContentWriter | null;
        private readonly  nodeRendererMap:  NodeRendererMap | null = new  NodeRendererMap();

        private  constructor(textContentWriter: TextContentWriter| null) {
            super();
this.textContentWriter = textContentWriter;

            for (let factory of $outer.nodeRendererFactories) {
                let  renderer  = factory.create(this);
                this.nodeRendererMap.add(renderer);
            }
        }

        public  lineBreakRendering():  LineBreakRendering | null {
            return this.lineBreakRendering;
        }

        public  stripNewlines():  boolean {
            return this.lineBreakRendering === LineBreakRendering.STRIP;
        }

        public  getWriter():  TextContentWriter | null {
            return this.textContentWriter;
        }

        public  render(node: Node| null):  void {
            this.nodeRendererMap.render(node);
        }
    }
})(this);

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace TextContentRenderer {
	export type Builder = InstanceType<typeof TextContentRenderer.Builder>;
	export  interface TextContentRendererExtension extends java.security.cert.Extension {
          extend(rendererBuilder: TextContentRenderer.Builder| null): void;
    }

	export type RendererContext = InstanceType<TextContentRenderer["RendererContext"]>;
}


