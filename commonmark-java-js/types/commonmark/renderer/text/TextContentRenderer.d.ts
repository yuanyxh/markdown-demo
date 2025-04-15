import type { Extension } from '@/Extension';
import type { Node } from '@/node';
import type { Appendable } from '@helpers/index';
import type { TextContentNodeRendererFactory } from './interfaces/TextContentNodeRendererFactory';
import type { Renderer } from '../interfaces/Renderer';
import LineBreakRendering from './enums/LineBreakRendering';
/**
 * Extension for {@link TextContentRenderer}.
 */
declare class TextContentRendererExtension implements Extension {
    extend(rendererBuilder: TextContentRendererBuilder): void;
}
declare class TextContentRendererBuilder {
    nodeRendererFactories: TextContentNodeRendererFactory[];
    lineBreakRendering: LineBreakRendering;
    /**
     * @return the configured {@link TextContentRenderer}
     */
    build(): TextContentRenderer;
    /**
     * Configure how line breaks (newlines) are rendered, see {@link LineBreakRendering}.
     * The default is {@link LineBreakRendering#COMPACT}.
     *
     * @param lineBreakRendering the mode to use
     * @return {@code this}
     */
    setLineBreakRendering(lineBreakRendering: LineBreakRendering): TextContentRendererBuilder;
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
    nodeRendererFactory(nodeRendererFactory: TextContentNodeRendererFactory): TextContentRendererBuilder;
    /**
     * @param extensions extensions to use on this text content renderer
     * @return {@code this}
     */
    extensions(extensions: Extension[]): TextContentRendererBuilder;
}
/**
 * Renders nodes to plain text content with minimal markup-like additions.
 */
declare class TextContentRenderer implements Renderer {
    readonly lineBreakRendering: LineBreakRendering;
    readonly nodeRendererFactories: TextContentNodeRendererFactory[];
    constructor(builder: TextContentRendererBuilder);
    /**
     * Create a new builder for configuring a {@link TextContentRenderer}.
     *
     * @return a builder
     */
    static builder(): TextContentRendererBuilder;
    render(node: Node, output: Appendable): void;
    /**
     * Builder for configuring a {@link TextContentRenderer}. See methods for default configuration.
     */
    static Builder: typeof TextContentRendererBuilder;
    static TextContentRendererExtension: typeof TextContentRendererExtension;
}
export default TextContentRenderer;
