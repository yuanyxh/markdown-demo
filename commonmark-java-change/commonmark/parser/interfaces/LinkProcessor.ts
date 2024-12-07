import type LinkResult from "../abstracts/LinkResult";
import type Scanner from "../parser_utils/Scanner";
import type { InlineParserContext } from "./InlineParserContext";
import type { LinkInfo } from "./LinkInfo";

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
 *
 * 决定如何处理链接/图像的处理器
 * <p>
 * 实现需要通过 {@link Parser.Builder#linkProcessor} 向解析器注册
 * 然后, 当运行内联解析时, 每个解析的链接/图像都会传递到处理器; 包括如下链接：
 * <p>
 * ```md
 * [text](destination)
 * [text]
 * [text][]
 * [text][label]
 * ```
 * 和图像：
 * ```md
 * ![text](目的地)
 * ！[text]
 * ！[text][]
 * ![text][destination]
 * ```
 * 请参阅 {@link LinkInfo} 以访问已解析的链接/图像的各个部分
 * <p>
 * 然后处理器可以检查链接/图像并通过返回适当的信息来决定如何处理 {@link LinkResult}
 * 如果它返回 {@link LinkResult#none()}, 则尝试下一个注册的处理器,
 * 如果他们都没有应用, 链接将像平常一样处理
 */
export interface LinkProcessor {
  /**
   * @param linkInfo information about the parsed link/image
   * @param scanner  the scanner at the current position after the parsed link/image
   * @param context  context for inline parsing
   * @return what to do with the link/image, e.g. do nothing (try the next processor), wrap the text in a node, or
   * replace the link/image with a node
   */
  process(
    linkInfo: LinkInfo,
    scanner: Scanner,
    context: InlineParserContext
  ): LinkResult | null;
}
