import type ParsedInline from "../abstracts/ParsedInline";
import type { InlineParserState } from "./InlineParserState";

/**
 * Parser for a type of inline content. Registered via a {@link InlineContentParserFactory} and created by its
 * {@link InlineContentParserFactory#create() create} method. The lifetime of this is tied to each inline content
 * snippet that is parsed, as a new instance is created for each.
 *
 * 一种内联内容的解析器, 通过 {@link InlineContentParserFactory} 注册并由其创建 {@link InlineContentParserFactory#create() create} 方法
 * 它的生命周期与每个内联内容相关, 解析的片段, 为每个片段创建一个新实例
 */
export interface InlineContentParser {
  /**
   * Try to parse inline content starting from the current position. Note that the character at the current position
   * is one of {@link InlineContentParserFactory#getTriggerCharacters()} of the factory that created this parser.
   * <p>
   * For a given inline content snippet that is being parsed, this method can be called multiple times: each time a
   * trigger character is encountered.
   *
   * 尝试从当前位置开始解析内联内容。注意当前位置的字符
   * 是创建此解析器的工厂的 {@link InlineContentParserFactory#getTriggerCharacters()} 之一
   * <p>
   * 对于正在解析的给定内联内容片段, 可以多次调用此方法: 每次遇到触发字符时
   *
   * @param inlineParserState the current state of the inline parser
   * @return the result of parsing; can indicate that this parser is not interested, or that parsing was successful
   */
  tryParse(inlineParserState: InlineParserState): ParsedInline | null;
}
