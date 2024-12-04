import type SourceLine from "../parser_utils/SourceLine";
import type { BlockParser } from "../interfaces/BlockParser";
import type { Block, DefinitionMap, SourceSpan } from "../../node";
import type { InlineParser } from "../interfaces/InlineParser";
import type { BlockContinue } from "../../parser";
import type { ParserState } from "../interfaces/ParserState";

/**
 * 块解析的抽象类
 */
abstract class AbstractBlockParser implements BlockParser {
  /**
   * 获取块节点
   */
  getBlock(): Block {
    throw new Error("Method not implemented.");
  }

  /**
   * 尝试解析子块
   *
   * @param parserState
   * @returns
   */
  tryContinue(parserState: ParserState): BlockContinue | null {
    return null;
  }

  /**
   * 是否是容器块
   *
   * @returns
   */
  public isContainer(): boolean {
    return false;
  }

  /**
   * 可以包含惰性文本行（惰性: 跨域多行的段落文本节点）
   *
   * @returns
   */
  public canHaveLazyContinuationLines(): boolean {
    return false;
  }

  /**
   * 判断是否可以包含子块
   *
   * @param childBlock
   * @returns
   */
  public canContain(childBlock: Block): boolean {
    return false;
  }

  /**
   * 填写行文本
   *
   * @param line
   */
  public addLine(line: SourceLine) {}

  /**
   * 添加节点的源码范围
   *
   * @param sourceSpan
   */
  public addSourceSpan(sourceSpan: SourceSpan) {
    this.getBlock().addSourceSpan(sourceSpan);
  }

  /**
   * 获取定义的
   *
   * @returns
   */
  public getDefinitions(): DefinitionMap<any>[] {
    return [];
  }

  /**
   * 关闭并完成块, 当前块不再有追加内容
   */
  public closeBlock() {}

  /**
   * 解析内联 markdown
   *
   * @param inlineParser
   */
  public parseInlines(inlineParser: InlineParser) {}
}

export default AbstractBlockParser;
