import type { InlineParserContext } from "./InlineParserContext";
import type { LinkInfo } from "./LinkInfo";
import type LinkResult from "../abstracts/LinkResult";
import type Scanner from "../parser_utils/Scanner";
/**
 * An interface to decide how links/images are handled.
 * <p>
 * Implementations need to be registered with a parser via {@link Parser.Builder#linkProcessor}.
 * Then, when inline parsing is run, each parsed link/image is passed to the processor. This includes links like these:
 * <p>
 * <pre><code>
 * [text](destination)
 * [text]
 * [text][]
 * [text][label]
 * </code></pre>
 * And images:
 * <pre><code>
 * ![text](destination)
 * ![text]
 * ![text][]
 * ![text][label]
 * </code></pre>
 * See {@link LinkInfo} for accessing various parts of the parsed link/image.
 * <p>
 * The processor can then inspect the link/image and decide what to do with it by returning the appropriate
 * {@link LinkResult}. If it returns {@link LinkResult#none()}, the next registered processor is tried. If none of them
 * apply, the link is handled as it normally would.
 */
export interface LinkProcessor {
    /**
     * @param linkInfo information about the parsed link/image
     * @param scanner  the scanner at the current position after the parsed link/image
     * @param context  context for inline parsing
     * @return what to do with the link/image, e.g. do nothing (try the next processor), wrap the text in a node, or
     * replace the link/image with a node
     */
    process(linkInfo: LinkInfo, scanner: Scanner, context: InlineParserContext): LinkResult | null;
}
