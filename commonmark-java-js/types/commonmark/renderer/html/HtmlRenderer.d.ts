import type { Extension } from '@/Extension';
import type { Node } from '@/node';
import type { AttributeProviderFactory } from './interfaces/AttributeProviderFactory';
import type { UrlSanitizer } from './interfaces/UrlSanitizer';
import type { HtmlNodeRendererFactory } from './interfaces/HtmlNodeRendererFactory';
import type { Renderer } from '../interfaces/Renderer';
import { Appendable } from '@helpers/index';
/**
 * Extension for {@link HtmlRenderer}.
 */
declare class HtmlRendererExtension implements Extension {
    extend(rendererBuilder: HtmlRendererBuilder): void;
}
declare class HtmlRendererBuilder {
    softbreak: string;
    escapeHtml: boolean;
    sanitizeUrls: boolean;
    urlSanitizer: UrlSanitizer;
    percentEncodeUrls: boolean;
    omitSingleParagraphP: boolean;
    attributeProviderFactories: AttributeProviderFactory[];
    nodeRendererFactories: HtmlNodeRendererFactory[];
    /**
     * @return the configured {@link HtmlRenderer}
     */
    build(): HtmlRenderer;
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
    setSoftbreak(softbreak: string): HtmlRendererBuilder;
    /**
     * Whether {@link HtmlInline} and {@link HtmlBlock} should be escaped, defaults to {@code false}.
     * <p>
     * Note that {@link HtmlInline} is only a tag itself, not the text between an opening tag and a closing tag. So
     * markup in the text will be parsed as normal and is not affected by this option.
     *
     * @param escapeHtml true for escaping, false for preserving raw HTML
     * @return {@code this}
     */
    setEscapeHtml(escapeHtml: boolean): HtmlRendererBuilder;
    /**
     * Whether {@link Image} src and {@link Link} href should be sanitized, defaults to {@code false}.
     *
     * @param sanitizeUrls true for sanitization, false for preserving raw attribute
     * @return {@code this}
     * @since 0.14.0
     */
    setSanitizeUrls(sanitizeUrls: boolean): HtmlRendererBuilder;
    /**
     * {@link UrlSanitizer} used to filter URL's if {@link #sanitizeUrls} is true.
     *
     * @param urlSanitizer Filterer used to filter {@link Image} src and {@link Link}.
     * @return {@code this}
     * @since 0.14.0
     */
    setUrlSanitizer(urlSanitizer: UrlSanitizer): HtmlRendererBuilder;
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
    setPercentEncodeUrls(percentEncodeUrls: boolean): HtmlRendererBuilder;
    /**
     * Whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag. Set to
     * {@code true} to render without the tag; the default of {@code false} always renders the tag.
     *
     * @return {@code this}
     */
    setOmitSingleParagraphP(omitSingleParagraphP: boolean): HtmlRendererBuilder;
    /**
     * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
     *
     * @param attributeProviderFactory the attribute provider factory to add
     * @return {@code this}
     */
    attributeProviderFactory(attributeProviderFactory: AttributeProviderFactory): HtmlRendererBuilder;
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
    nodeRendererFactory(nodeRendererFactory: HtmlNodeRendererFactory): HtmlRendererBuilder;
    /**
     * @param extensions extensions to use on this HTML renderer
     * @return {@code this}
     */
    extensions(extensions: Extension[]): HtmlRendererBuilder;
}
/**
 * Renders a tree of nodes to HTML.
 * <p>
 * Start with the {@link #builder} method to configure the renderer. Example:
 * <pre><code>
 * HtmlRenderer renderer = HtmlRenderer.builder().escapeHtml(true).build();
 * renderer.render(node);
 * </code></pre>
 */
declare class HtmlRenderer implements Renderer {
    readonly softbreak: string;
    readonly escapeHtml: boolean;
    readonly percentEncodeUrls: boolean;
    readonly omitSingleParagraphP: boolean;
    readonly sanitizeUrls: boolean;
    readonly urlSanitizer: UrlSanitizer;
    readonly attributeProviderFactories: AttributeProviderFactory[];
    readonly nodeRendererFactories: HtmlNodeRendererFactory[];
    constructor(builder: HtmlRendererBuilder);
    /**
     * Create a new builder for configuring an {@link HtmlRenderer}.
     *
     * @return a builder
     */
    static builder(): HtmlRendererBuilder;
    render(node: Node, output?: Appendable): string;
    /**
     * Builder for configuring an {@link HtmlRenderer}. See methods for default configuration.
     */
    static Builder: typeof HtmlRendererBuilder;
    static HtmlRendererExtension: typeof HtmlRendererExtension;
}
export default HtmlRenderer;
