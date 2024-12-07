import type { Block, DefinitionMap, SourceSpan } from "../../node";
import type { InlineParser } from "./InlineParser";
import type SourceLine from "../parser_utils/SourceLine";
import type { ParserState } from "./ParserState";
import type { BlockContinue } from "../../parser";

/**
 * Parser for a specific block node.
 * <p>
 * Implementations should subclass {@link AbstractBlockParser} instead of implementing this directly.
 *
 * 特定块节点的解析器。
 * <p>
 * 实现应该子类化 {@link AbstractBlockParser} 而不是直接实现它
 */
export interface BlockParser {
  /**
   * Return true if the block that is parsed is a container (contains other blocks), or false if it's a leaf.
   *
   * 如果解析的块是容器（包含其他块）, 则返回 true, 如果是叶块, 则返回 false
   */
  isContainer(): boolean;

  /**
   * Return true if the block can have lazy continuation lines.
   * <p>
   * Lazy continuation lines are lines that were rejected by this {@link #tryContinue(ParserState)} but didn't match
   * any other block parsers either.
   * <p>
   * If true is returned here, those lines will get added via {@link #addLine(SourceLine)}. For false, the block is
   * closed instead.
   *
   * 如果块可以有惰性连续行, 则返回 true
   * <p>
   * 惰性延续行是被此 {@link #tryContinue(ParserState)} 拒绝但不匹配任何其他块解析器的行
   * <p>
   * 如果此处返回 true, 这些行将通过 {@link #addLine(SourceLine)} 添加; 对于 false, 关闭当前块
   */
  canHaveLazyContinuationLines(): boolean;

  /**
   * 是否可以包含指定的子块
   *
   * @param childBlock
   */
  canContain(childBlock: Block): boolean;

  /**
   * 获取块节点
   */
  getBlock(): Block;

  /**
   * 尝试继续解析块内容
   *
   * @param parserState
   */
  tryContinue(parserState: ParserState): BlockContinue | null;

  /**
   * Add the part of a line that belongs to this block parser to parse (i.e. without any container block markers).
   * Note that the line will only include a {@link SourceLine#getSourceSpan()} if source spans are enabled for inlines.
   *
   * 添加属于此块解析器的行的一部分进行解析（即没有任何容器块标记）
   * 请注意, 如果为内联启用了源码映射, 则该行将仅包含 {@link SourceLine#getSourceSpan()}
   */
  addLine(line: SourceLine): void;

  /**
   * Add a source span of the currently parsed block. The default implementation in {@link AbstractBlockParser} adds
   * it to the block. Unless you have some complicated parsing where you need to check source positions, you don't
   * need to override this.
   *
   * 添加当前解析块的源范围, {@link AbstractBlockParser} 中的默认实现将其添加到块中
   * 除非有一些复杂的解析需要检查源位置, 否则不需要覆盖这个
   *
   * @since 0.16.0
   */
  addSourceSpan(sourceSpan: SourceSpan): void;

  /**
   * Return definitions parsed by this parser. The definitions returned here can later be accessed during inline
   * parsing via {@link InlineParserContext#getDefinition}.
   *
   * 返回由该解析器解析的定义, 稍后可以在内联期间访问此处返回的定义
   * 通过 {@link InlineParserContext#getDefinition} 进行解析
   */
  getDefinitions(): DefinitionMap<any>[];

  /**
   * 关闭块
   */
  closeBlock(): void;

  /**
   * 解析内联内容
   *
   * @param inlineParser
   */
  parseInlines(inlineParser: InlineParser): void;
}
