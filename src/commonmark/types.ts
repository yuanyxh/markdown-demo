import Parser from "./blocks";
import MarkdownNode from "./node";

/** 源码位置 */
export type TSourcePos = [[number, number], [number, number]];

/** markdown 节点类型 */
export type TMarkdownNodeType =
  | /** 文档 */
  "document"
  /** 标题  */
  | "heading"
  /** 段落 */
  | "paragraph"
  /** 块引用 */
  | "block_quote"
  /** 代码块 */
  | "code_block"
  /** 列表 */
  | "list"
  /** 列表项 */
  | "item"
  /** 主题分割 */
  | "thematic_break"
  /** html 块 */
  | "html_block"
  /** 文本 */
  | "text"
  /** 内联代码 */
  | "code"
  /** em 斜体 */
  | "emph"
  /** 粗体 */
  | "strong"
  /** 图片 */
  | "image"
  /** 链接 */
  | "link"
  /** html 链接 */
  | "html_inline"
  /** 换行 */
  | "linebreak"
  /** 软换行 */
  | "softbreak"
  | "custom_block"
  | "custom_inline";

/** 列表相关数据 */
export interface IListData {
  /** 列表类型 */
  type: "ordered" | "bullet" | null;
  /** 是否紧凑列表 */
  tight: boolean | null;
  /** 列表开始序号 */
  start: number | null;
  /** 有序列表的描述符 */
  delimiter: "." | ")" | null;
  padding: number | null;
  bulletChar: string | null;
  markerOffset: number;
}

/** 解析器选项 */
export interface IParserOptions {
  time?: boolean;
  smart?: boolean;
}

/** 块运行解析 */
export interface IParserBlockRun {
  /** 运行 "continue" 来检查块是否正在继续 */
  continue(parser: Parser, container: MarkdownNode): number;
  /** 当块关闭时运行 “finalize” */
  finalize(parser: Parser, block: MarkdownNode): void;
  /** 判断是否能够包含指定 type 的子级 */
  canContain(type: TMarkdownNodeType): boolean;
  acceptsLines: boolean;
}

/** 解析块开始的函数 */
export type TParserBlockStartsFun = (
  parser: Parser,
  container: MarkdownNode
) => 0 | 1 | 2;

export type TNodeWalker = {
  entering: boolean;
  node: MarkdownNode;
} | null;

export interface IInlineDelimiters {
  cc: number;
  numdelims: number;
  origdelims: number;
  node: MarkdownNode;
  previous: IInlineDelimiters | null;
  next: IInlineDelimiters | null;
  can_open: boolean;
  can_close: boolean;
}

export interface IInlineBrackets {
  node: MarkdownNode;
  previous: IInlineBrackets | null;
  previousDelimiter: IInlineDelimiters | null;
  index: number;
  image: boolean;
  active: boolean;
  bracketAfter?: boolean;
}

export interface IRefmap {
  destination: string;
  title: string;
}
