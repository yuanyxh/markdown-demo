


import { java, JavaObject, S } from "jree";



/**
 * Renders a tree of nodes to HTML.
 * <p>
 * Start with the {@link #builder} method to configure the renderer. Example:
 * <pre><code>
 * HtmlRenderer renderer = HtmlRenderer.builder().escapeHtml(true).build();
 * renderer.render(node);
 * </code></pre>
 */
export  class HtmlRenderer extends JavaObject implements Renderer {

    private readonly  softbreak:  java.lang.String | null;
    private readonly  escapeHtml:  boolean;
    private readonly  percentEncodeUrls:  boolean;
    private readonly  omitSingleParagraphP:  boolean;
    private readonly  sanitizeUrls:  boolean;
    private readonly  urlSanitizer:  UrlSanitizer | null;
    private readonly  attributeProviderFactories:  java.util.List<AttributeProviderFactory> | null;
    private readonly  nodeRendererFactories:  java.util.List<HtmlNodeRendererFactory> | null;

    private  constructor(builder: HtmlRenderer.Builder| null) {
        super();
this.softbreak = builder.softbreak;
        this.escapeHtml = builder.escapeHtml;
        this.percentEncodeUrls = builder.percentEncodeUrls;
        this.omitSingleParagraphP = builder.omitSingleParagraphP;
        this.sanitizeUrls = builder.sanitizeUrls;
        this.urlSanitizer = builder.urlSanitizer;
        this.attributeProviderFactories = new  java.util.ArrayList(builder.attributeProviderFactories);

        this.nodeRendererFactories = new  java.util.ArrayList(builder.nodeRendererFactories.size() + 1);
        this.nodeRendererFactories.addAll(builder.nodeRendererFactories);
        // Add as last. This means clients can override the rendering of core nodes if they want.
        this.nodeRendererFactories.add(new  class extends HtmlNodeRendererFactory {
            public  create(context: HtmlNodeRendererContext| null):  NodeRenderer | null {
                return new  CoreHtmlNodeRenderer(context);
            }
        }());
    }

    /**
     * Create a new builder for configuring an {@link HtmlRenderer}.
     *
     * @return a builder
     */
    public static  builder():  HtmlRenderer.Builder | null {
        return new  HtmlRenderer.Builder();
    }

    public  render(node: Node| null):  java.lang.String | null;

    public  render(node: Node| null, output: java.lang.Appendable| null):  void;
public render(...args: unknown[]):  java.lang.String | null |  void {
		switch (args.length) {
			case 1: {
				const [node] = args as [Node];


        java.util.Objects.requireNonNull(node, "node must not be null");
        let  sb: java.lang.StringBuilder = new  java.lang.StringBuilder();
        this.render(node, sb);
        return sb.toString();
    

				break;
			}

			case 2: {
				const [node, output] = args as [Node, java.lang.Appendable];


        java.util.Objects.requireNonNull(node, "node must not be null");
        let  context: HtmlRenderer.RendererContext = new  RendererContext(new  HtmlWriter(output));
        context.beforeRoot(node);
        context.render(node);
        context.afterRoot(node);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /**
     * Builder for configuring an {@link HtmlRenderer}. See methods for default configuration.
     */
    public static Builder =  class Builder extends JavaObject {

        private  softbreak:  java.lang.String | null = "\n";
        private  escapeHtml:  boolean = false;
        private  sanitizeUrls:  boolean = false;
        private  urlSanitizer:  UrlSanitizer | null = new  DefaultUrlSanitizer();
        private  percentEncodeUrls:  boolean = false;
        private  omitSingleParagraphP:  boolean = false;
        private  attributeProviderFactories:  java.util.List<AttributeProviderFactory> | null = new  java.util.ArrayList();
        private  nodeRendererFactories:  java.util.List<HtmlNodeRendererFactory> | null = new  java.util.ArrayList();

        /**
         * @return the configured {@link HtmlRenderer}
         */
        public  build():  HtmlRenderer | null {
            return new  HtmlRenderer(this);
        }

        /**
         * The HTML to use for rendering a softbreak, defaults to {@code "\n"} (meaning the rendered result doesn't have
         * a line break).
         * <p>
         * Set it to {@code "<br>"} (or {@code "<br />"} to make them hard breaks.
         * <p>
         * Set it to {@code " "} to ignore line wrapping in the source.
         *
         * @param softbreak HTML for softbreak
         * @return {@code this}
         */
        public  softbreak(softbreak: java.lang.String| null):  HtmlRenderer.Builder | null {
            this.softbreak = softbreak;
            return this;
        }

        /**
         * Whether {@link HtmlInline} and {@link HtmlBlock} should be escaped, defaults to {@code false}.
         * <p>
         * Note that {@link HtmlInline} is only a tag itself, not the text between an opening tag and a closing tag. So
         * markup in the text will be parsed as normal and is not affected by this option.
         *
         * @param escapeHtml true for escaping, false for preserving raw HTML
         * @return {@code this}
         */
        public  escapeHtml(escapeHtml: boolean):  HtmlRenderer.Builder | null {
            this.escapeHtml = escapeHtml;
            return this;
        }

        /**
         * Whether {@link Image} src and {@link Link} href should be sanitized, defaults to {@code false}.
         *
         * @param sanitizeUrls true for sanitization, false for preserving raw attribute
         * @return {@code this}
         * @since 0.14.0
         */
        public  sanitizeUrls(sanitizeUrls: boolean):  HtmlRenderer.Builder | null {
            this.sanitizeUrls = sanitizeUrls;
            return this;
        }

        /**
         * {@link UrlSanitizer} used to filter URL's if {@link #sanitizeUrls} is true.
         *
         * @param urlSanitizer Filterer used to filter {@link Image} src and {@link Link}.
         * @return {@code this}
         * @since 0.14.0
         */
        public  urlSanitizer(urlSanitizer: UrlSanitizer| null):  HtmlRenderer.Builder | null {
            this.urlSanitizer = urlSanitizer;
            return this;
        }

        /**
         * Whether URLs of link or images should be percent-encoded, defaults to {@code false}.
         * <p>
         * If enabled, the following is done:
         * <ul>
         * <li>Existing percent-encoded parts are preserved (e.g. "%20" is kept as "%20")</li>
         * <li>Reserved characters such as "/" are preserved, except for "[" and "]" (see encodeURI in JS)</li>
         * <li>Unreserved characters such as "a" are preserved</li>
         * <li>Other characters such umlauts are percent-encoded</li>
         * </ul>
         *
         * @param percentEncodeUrls true to percent-encode, false for leaving as-is
         * @return {@code this}
         */
        public  percentEncodeUrls(percentEncodeUrls: boolean):  HtmlRenderer.Builder | null {
            this.percentEncodeUrls = percentEncodeUrls;
            return this;
        }

        /**
         * Whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag. Set to
         * {@code true} to render without the tag; the default of {@code false} always renders the tag.
         *
         * @return {@code this}
         */
        public  omitSingleParagraphP(omitSingleParagraphP: boolean):  HtmlRenderer.Builder | null {
            this.omitSingleParagraphP = omitSingleParagraphP;
            return this;
        }

        /**
         * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
         *
         * @param attributeProviderFactory the attribute provider factory to add
         * @return {@code this}
         */
        public  attributeProviderFactory(attributeProviderFactory: AttributeProviderFactory| null):  HtmlRenderer.Builder | null {
            java.util.Objects.requireNonNull(attributeProviderFactory, "attributeProviderFactory must not be null");
            this.attributeProviderFactories.add(attributeProviderFactory);
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
        public  nodeRendererFactory(nodeRendererFactory: HtmlNodeRendererFactory| null):  HtmlRenderer.Builder | null {
            java.util.Objects.requireNonNull(nodeRendererFactory, "nodeRendererFactory must not be null");
            this.nodeRendererFactories.add(nodeRendererFactory);
            return this;
        }

        /**
         * @param extensions extensions to use on this HTML renderer
         * @return {@code this}
         */
        public  extensions(extensions: java.lang.Iterable< java.security.cert.Extension>| null):  HtmlRenderer.Builder | null {
            java.util.Objects.requireNonNull(extensions, "extensions must not be null");
            for (let extension of extensions) {
                if (extension instanceof HtmlRendererExtension) {
                    let  htmlRendererExtension: Builder.HtmlRendererExtension =  extension as HtmlRendererExtension;
                    htmlRendererExtension.extend(this);
                }
            }
            return this;
        }
    };


    public RendererContext = (($outer) => {
return  class RendererContext extends JavaObject implements HtmlNodeRendererContext, AttributeProviderContext {

        private readonly  htmlWriter:  HtmlWriter | null;
        private readonly  attributeProviders:  java.util.List<AttributeProvider> | null;
        private readonly  nodeRendererMap:  NodeRendererMap | null = new  NodeRendererMap();

        private  constructor(htmlWriter: HtmlWriter| null) {
            super();
this.htmlWriter = htmlWriter;

            this.attributeProviders = new  java.util.ArrayList($outer.attributeProviderFactories.size());
            for (let attributeProviderFactory of $outer.attributeProviderFactories) {
                this.attributeProviders.add(attributeProviderFactory.create(this));
            }

            for (let factory of $outer.nodeRendererFactories) {
                let  renderer  = factory.create(this);
                this.nodeRendererMap.add(renderer);
            }
        }

        public  shouldEscapeHtml():  boolean {
            return $outer.escapeHtml;
        }

        public  shouldOmitSingleParagraphP():  boolean {
            return $outer.omitSingleParagraphP;
        }

        public  shouldSanitizeUrls():  boolean {
            return $outer.sanitizeUrls;
        }

        public  urlSanitizer():  UrlSanitizer | null {
            return this.urlSanitizer;
        }

        public  encodeUrl(url: java.lang.String| null):  java.lang.String | null {
            if ($outer.percentEncodeUrls) {
                return Escaping.percentEncodeUrl(url);
            } else {
                return url;
            }
        }

        public  extendAttributes(node: Node| null, tagName: java.lang.String| null, attributes: java.util.Map<java.lang.String, java.lang.String>| null):  java.util.Map<java.lang.String, java.lang.String> | null {
            let  attrs: java.util.Map<java.lang.String, java.lang.String> = new  java.util.LinkedHashMap(attributes);
            this.setCustomAttributes(node, tagName, attrs);
            return attrs;
        }

        public  getWriter():  HtmlWriter | null {
            return this.htmlWriter;
        }

        public  getSoftbreak():  java.lang.String | null {
            return $outer.softbreak;
        }

        public  render(node: Node| null):  void {
            this.nodeRendererMap.render(node);
        }

        public  beforeRoot(node: Node| null):  void {
            this.nodeRendererMap.beforeRoot(node);
        }

        public  afterRoot(node: Node| null):  void {
            this.nodeRendererMap.afterRoot(node);
        }

        private  setCustomAttributes(node: Node| null, tagName: java.lang.String| null, attrs: java.util.Map<java.lang.String, java.lang.String>| null):  void {
            for (let attributeProvider of this.attributeProviders) {
                attributeProvider.setAttributes(node, tagName, attrs);
            }
        }
    }
})(this);

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace HtmlRenderer {
	export type Builder = InstanceType<typeof HtmlRenderer.Builder>;
	export  interface HtmlRendererExtension extends java.security.cert.Extension {
          extend(rendererBuilder: HtmlRenderer.Builder| null): void;
    }

	export type RendererContext = InstanceType<HtmlRenderer["RendererContext"]>;
}


