import type { Extension } from '@/Extension';
import type { Node } from '@/node';
import type { MarkdownNodeRendererFactory } from './interfaces/MarkdownNodeRendererFactory';
import type { Renderer } from '../interfaces/Renderer';
import { Appendable } from '@helpers/index';
declare class MarkdownRendererExtension implements Extension {
    /**
     * Extend Markdown rendering, usually by registering custom node renderers using {@link Builder#nodeRendererFactory}.
     *
     * @param rendererBuilder the renderer builder to extend
     */
    extend(rendererBuilder: MarkdownNodeRendererBuilder): void;
}
declare class MarkdownNodeRendererBuilder {
    readonly nodeRendererFactories: MarkdownNodeRendererFactory[];
    /**
     * @return the configured {@link MarkdownRenderer}
     */
    build(): MarkdownRenderer;
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
    nodeRendererFactory(nodeRendererFactory: MarkdownNodeRendererFactory): MarkdownNodeRendererBuilder;
    /**
     * @param extensions extensions to use on this renderer
     * @return {@code this}
     */
    extensions(extensions: Extension[]): MarkdownNodeRendererBuilder;
}
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
export declare class MarkdownRenderer implements Renderer {
    readonly nodeRendererFactories: MarkdownNodeRendererFactory[];
    constructor(builder: MarkdownNodeRendererBuilder);
    /**
     * Create a new builder for configuring a {@link MarkdownRenderer}.
     *
     * @return a builder
     */
    static builder(): MarkdownNodeRendererBuilder;
    render(node: Node, output?: Appendable): string;
    /**
     * Builder for configuring a {@link MarkdownRenderer}. See methods for default configuration.
     */
    static Builder: typeof MarkdownNodeRendererBuilder;
    static MarkdownRendererExtension: typeof MarkdownRendererExtension;
}
export default MarkdownRenderer;
