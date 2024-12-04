import type { DelimiterProcessor } from "./DelimiterProcessor";
import type { InlineContentParserFactory } from "./InlineContentParserFactory";
import type { LinkProcessor } from "./LinkProcessor";
import type { LinkReferenceDefinition } from "../../node";

/**
 * Context for inline parsing.
 *
 * 内联解析的上下文
 */
export interface InlineParserContext {
  /**
   * @return custom inline content parsers that have been configured with
   * {@link Parser.Builder#customInlineContentParserFactory(InlineContentParserFactory)}
   */
  getCustomInlineContentParserFactories(): InlineContentParserFactory[];

  /**
   * @return custom delimiter processors that have been configured with
   * {@link Parser.Builder#customDelimiterProcessor(DelimiterProcessor)}
   */
  getCustomDelimiterProcessors(): DelimiterProcessor[];

  /**
   * @return custom link processors that have been configured with {@link Parser.Builder#linkProcessor}.
   */
  getCustomLinkProcessors(): LinkProcessor[];

  /**
   * @return custom link markers that have been configured with {@link Parser.Builder#linkMarker}.
   */
  getCustomLinkMarkers(): Set<string>;

  /**
   * Look up a {@link LinkReferenceDefinition} for a given label.
   * <p>
   * Note that the passed in label does not need to be normalized; implementations are responsible for doing the
   * normalization before lookup.
   *
   * @param label the link label to look up
   * @return the definition if one exists, {@code null} otherwise
   * @deprecated use {@link #getDefinition} with {@link LinkReferenceDefinition} instead
   */
  getLinkReferenceDefinition(label: string): LinkReferenceDefinition | null;

  /**
   * Look up a definition of a type for a given label.
   * <p>
   * Note that the passed in label does not need to be normalized; implementations are responsible for doing the normalization before lookup.
   *
   * 查找给定标签的类型定义
   * <p>
   * 注意传入的标签不需要标准化; 实现负责在查找之前进行规范化
   *
   * @return the definition if one exists, null otherwise
   */
  getDefinition<D extends abstract new (...args: any) => any>(
    type: D,
    label: string
  ): InstanceType<D> | null;
}
