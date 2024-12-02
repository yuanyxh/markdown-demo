import MarkdownNode from "./node";
import { unescapeString, OPENTAG, CLOSETAG } from "./common";
import InlineParser from "./inlines";

import type { IWalker } from "./node";

interface IBlockParserContinue {
  continue(parser: Parser, node: MarkdownNode): number;
  finalize(parser: Parser, node: MarkdownNode): void;
  canContain(type: string): boolean;
  acceptsLines: boolean;
}

type TBlockParserContinueGroup = {
  [key: string]: IBlockParserContinue;
};

/**
 * 解析块开始的函数
 * 返回值：
 *   0: 没有匹配到块
 *   1: 匹配到了容器块
 *   2: 匹配到了叶块，没有更多内部块
 *  */
type TBlockStartMatch = (parser: Parser, node: MarkdownNode) => number;

/** 缩进代码块，4 空白符限制 */
const CODE_INDENT = 4;

/** 制表符码点 \t */
const C_TAB = 9;
/** 换行符码点 \n */
const C_NEWLINE = 10;
/** 大于号码点 > */
const C_GREATERTHAN = 62;
/** 小于号码点 < */
const C_LESSTHAN = 60;
/** 空格 */
const C_SPACE = 32;
/** 左中括号 [ */
const C_OPEN_BRACKET = 91;

/**
 * html 块开始解析正则
 *
 * 0: 无匹配
 * 1: 匹配 script pre textarea style
 * 2: 匹配注释
 * 3: 匹配指令
 * 4: 匹配声明
 * 5: 匹配 CDATA
 * 6: 匹配 html 块元素
 * 7: 匹配自定义 html 块元素
 * */
const reHtmlBlockOpen = [
  /./, // dummy for 0
  /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
  /^<!--/,
  /^<[?]/,
  /^<![A-Za-z]/,
  /^<!\[CDATA\[/,
  /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
  new RegExp("^(?:" + OPENTAG + "|" + CLOSETAG + ")\\s*$", "i"),
];

/**
 * html 块结束解析
 *
 * 0: 无匹配
 * 1: 匹配 script pre textarea style
 * 2: 匹配注释
 * 3: 匹配指令
 * 4: 匹配声明
 * 5: 匹配 CDATA
 */
const reHtmlBlockClose = [
  /./, // dummy for 0
  /<\/(?:script|pre|textarea|style)>/i,
  /-->/,
  /\?>/,
  />/,
  /\]\]>/,
];

/** 匹配主题分割 */
const reThematicBreak =
  /^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/;

/** 匹配可能的块内容 */
const reMaybeSpecial = /^[#`~*+_=<>0-9-]/;

/** 匹配非空白行 */
const reNonSpace = /[^ \t\f\v\r\n]/;

/** 匹配无序列表 */
const reBulletListMarker = /^[*+-]/;

/** 匹配有序列表 */
const reOrderedListMarker = /^(\d{1,9})([.)])/;

/** 匹配 ATX 标题 */
const reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;

/** 匹配开始代码围栏块 */
const reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;

/** 匹配结束代码围栏块 */
const reClosingCodeFence = /^(?:`{3,}|~{3,})(?=[ \t]*$)/;

/** 匹配 Setext 标题 */
const reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;

/** 换行符 */
const reLineEnding = /\r\n|\n|\r/;

// Returns true if string contains only space characters.
/** 如果字符串仅包含空格字符，则返回 true */
const isBlank = function (s: string) {
  return !reNonSpace.test(s);
};

/** codePoint 是空格或制表符 */
const isSpaceOrTab = function (c: number) {
  return c === C_SPACE || c === C_TAB;
};

/** 获取指定位置字符串的码点 */
const peek = function (ln: string, pos: number) {
  if (pos < ln.length) {
    return ln.charCodeAt(pos);
  } else {
    return -1;
  }
};

// Returns true if block ends with a blank line.
/** 如果块以空行结束则返回 true */
const endsWithBlankLine = function (block: MarkdownNode) {
  return block.next && block.sourcepos[1][0] !== block.next.sourcepos[0][0] - 1;
};

// Parse a list marker and return data on the marker (type, start, delimiter, bullet character, padding) or null.
/** 解析列表标记并返回标记上的数据（类型、开始数字、分隔符、项目符号字符、填充）或 null */
const parseListMarker = function (parser: Parser, container: MarkdownNode) {
  const rest = parser.currentLine.slice(parser.nextNonspace);
  let match: RegExpMatchArray | null;
  let nextc: number;
  let spacesStartCol: number;
  let spacesStartOffset: number;

  const data: IListData = {
    tight: true, // lists are tight by default
    markerOffset: parser.indent,
  };

  // 确保不在缩进代码块的范围
  if (parser.indent >= 4) {
    return null;
  }

  // 匹配无序列表
  if ((match = rest.match(reBulletListMarker))) {
    data.type = "bullet";
    data.bulletChar = match[0][0];
  } else if (
    // 匹配有序列表
    (match = rest.match(reOrderedListMarker)) &&
    (container.type !== "paragraph" || Number(match[1]) === 1)
  ) {
    data.type = "ordered";
    data.start = parseInt(match[1]);
    data.delimiter = match[2];
  } else {
    return null;
  }

  // make sure we have spaces after
  // 确保后面有空格（后续要么没有字符要么有一个空白字符）
  nextc = peek(parser.currentLine, parser.nextNonspace + match[0].length);
  if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
    return null;
  }

  // if it interrupts paragraph, make sure first line isn't blank
  // 如果它打断段落，确保第一行不是空白
  if (
    container.type === "paragraph" &&
    !parser.currentLine
      .slice(parser.nextNonspace + match[0].length)
      .match(reNonSpace)
  ) {
    return null;
  }

  // we've got a match! advance offset and calculate padding
  // 匹配到了列表项，提前偏移并计算填充
  // 前进到非空白字符
  parser.advanceNextNonspace(); // to start of marker
  // 跳过匹配的语法数量
  parser.advanceOffset(match[0].length, true); // to end of marker

  spacesStartCol = parser.column;
  spacesStartOffset = parser.offset;

  // 前进后续的空格数量，只要小于 5 个空白字符内（列表项语法后必须有一个空白字符，而缩进代码块需要 4 个空白字符）
  // 此处最多前进 4 个空白字符
  do {
    parser.advanceOffset(1, true);
    nextc = peek(parser.currentLine, parser.offset);
  } while (parser.column - spacesStartCol < 5 && isSpaceOrTab(nextc));

  const blank_item = peek(parser.currentLine, parser.offset) === -1;
  const spaces_after_marker = parser.column - spacesStartCol;

  // 如果内部是缩进代码块、没有空格符或空项目
  if (spaces_after_marker >= 5 || spaces_after_marker < 1 || blank_item) {
    data.padding = match[0].length + 1;
    parser.column = spacesStartCol;
    parser.offset = spacesStartOffset;

    if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
      parser.advanceOffset(1, true);
    }
  } else {
    data.padding = match[0].length + spaces_after_marker;
  }

  return data;
};

// Returns true if the two list items are of the same type, with the same delimiter and bullet character.  This is used in agglomerating list items into lists.
/** 如果两个列表项具有相同的类型、相同的分隔符和项目符号字符，则返回 true；用于将列表项聚合到列表中 */
const listsMatch = function (list_data: IListData, item_data: IListData) {
  return (
    list_data.type === item_data.type &&
    list_data.delimiter === item_data.delimiter &&
    list_data.bulletChar === item_data.bulletChar
  );
};

// Remove link reference definitions from given tree.
/** 从给定树中删除链接引用定义 */
const removeLinkReferenceDefinitions = function (
  parser: Parser,
  tree: MarkdownNode
) {
  let event: IWalker | null;
  let node: MarkdownNode | null;

  // 创建 tree 迭代器
  const walker = tree.walker();
  // 空节点集合
  const emptyNodes: MarkdownNode[] = [];

  // 迭代树
  while ((event = walker.next())) {
    node = event.node;

    // 如果是段落
    if (event.entering && node.type === "paragraph") {
      let pos: number;
      let hasReferenceDefs = false;

      // Try parsing the beginning as link reference definitions; Note that link reference definitions must be the beginning of a paragraph node since link reference definitions cannot interrupt paragraphs.
      // 尝试将开头解析为链接引用定义；请注意，链接引用定义必须是段落节点的开头，因为链接引用定义不能中断段落。
      while (
        peek(node.string_content, 0) === C_OPEN_BRACKET &&
        (pos = parser.inlineParser.parseReference(
          node.string_content,
          parser.refmap
        ))
      ) {
        const removedText = node.string_content.slice(0, pos);

        node.string_content = node.string_content.slice(pos);
        hasReferenceDefs = true;

        const lines = removedText.split("\n");

        // -1 for final newline.
        node.sourcepos[0][0] += lines.length - 1;
      }

      if (hasReferenceDefs && isBlank(node.string_content)) {
        emptyNodes.push(node);
      }
    }
  }

  for (node of emptyNodes) {
    node.unlink();
  }
};

// 'finalize' is run when the block is closed.
// 'continue' is run to check whether the block is continuing
// at a certain line and offset (e.g. whether a block quote
// contains a `>`.  It returns 0 for matched, 1 for not matched,
// and 2 for "we've dealt with this line completely, go to next."
const blocks: TBlockParserContinueGroup = {
  document: {
    continue: function () {
      return 0;
    },
    finalize: function (parser, block) {
      removeLinkReferenceDefinitions(parser, block);
      return;
    },
    canContain: function (t) {
      return t !== "item";
    },
    acceptsLines: false,
  },
  list: {
    continue: function () {
      return 0;
    },
    finalize: function (parser, block) {
      let item = block.firstChild;

      while (item) {
        // check for non-final list item ending with blank line:
        // 检查以空行结尾的非最终列表项：
        // 如果不是最后一个列表项，且当前列表项以空行结束，则列表是松散的
        if (item.next && endsWithBlankLine(item)) {
          block.listData.tight = false;
          break;
        }

        // recurse into children of list item, to see if there are spaces between any of them:
        // 递归到列表项的子项，查看它们之间是否有空格：
        let subitem = item.firstChild;
        while (subitem) {
          if (subitem.next && endsWithBlankLine(subitem)) {
            block.listData.tight = false;

            break;
          }

          subitem = subitem.next;
        }

        item = item.next;
      }

      // TODO: new add
      if (block.lastChild === null) {
        throw new Error("Not have a block.lastChild.");
      }

      block.sourcepos[1] = block.lastChild.sourcepos[1];
    },
    canContain: function (t) {
      return t === "item";
    },
    acceptsLines: false,
  },
  block_quote: {
    continue: function (parser) {
      const ln = parser.currentLine;

      if (!parser.indented && peek(ln, parser.nextNonspace) === C_GREATERTHAN) {
        parser.advanceNextNonspace();
        parser.advanceOffset(1, false);

        if (isSpaceOrTab(peek(ln, parser.offset))) {
          parser.advanceOffset(1, true);
        }
      } else {
        return 1;
      }

      return 0;
    },
    finalize: function () {
      return;
    },
    canContain: function (t) {
      return t !== "item";
    },
    acceptsLines: false,
  },
  item: {
    continue: function (parser, container) {
      if (parser.blank) {
        if (container.firstChild === null) {
          // Blank line after empty list item
          // 空列表项后的空行
          return 1;
        } else {
          parser.advanceNextNonspace();
        }
      } else if (
        // TODO: new add
        typeof container.listData.markerOffset !== "undefined" &&
        typeof container.listData.padding !== "undefined" &&
        parser.indent >=
          container.listData.markerOffset + container.listData.padding
      ) {
        parser.advanceOffset(
          container.listData.markerOffset + container.listData.padding,
          true
        );
      } else {
        return 1;
      }

      return 0;
    },
    finalize: function (parser, block) {
      if (block.lastChild) {
        block.sourcepos[1] = block.lastChild.sourcepos[1];
      } else {
        // Empty list item
        // 空列表项
        block.sourcepos[1][0] = block.sourcepos[0][0];

        // TODO: new add
        if (
          typeof block.listData.markerOffset !== "undefined" &&
          typeof block.listData.padding !== "undefined"
        ) {
          block.sourcepos[1][1] =
            block.listData.markerOffset + block.listData.padding;
        }
      }

      return;
    },
    canContain: function (t) {
      return t !== "item";
    },
    acceptsLines: false,
  },
  heading: {
    continue: function () {
      // a heading can never container > 1 line, so fail to match:
      return 1;
    },
    finalize: function () {
      return;
    },
    canContain: function () {
      return false;
    },
    acceptsLines: false,
  },
  thematic_break: {
    continue: function () {
      // a thematic break can never container > 1 line, so fail to match:
      return 1;
    },
    finalize: function () {
      return;
    },
    canContain: function () {
      return false;
    },
    acceptsLines: false,
  },
  code_block: {
    continue: function (parser, container) {
      const ln = parser.currentLine;
      const indent = parser.indent;

      // 围栏代码块
      if (container.isFenced) {
        // fenced
        const match =
          indent <= 3 &&
          ln.charAt(parser.nextNonspace) === container.fenceChar &&
          ln.slice(parser.nextNonspace).match(reClosingCodeFence);

        if (match && match[0].length >= container.fenceLength) {
          // closing fence - we're at end of line, so we can return
          // 关闭栅栏 - 我们已经到了队伍的尽头，所以我们可以返回
          parser.lastLineLength = parser.offset + indent + match[0].length;
          parser.finalize(container, parser.lineNumber);

          return 2;
        } else {
          // skip optional spaces of fence offset
          // 跳过栅栏偏移的可选空格
          let i = container.fenceOffset;

          // TODO: new add
          if (i !== null) {
            while (i > 0 && isSpaceOrTab(peek(ln, parser.offset))) {
              parser.advanceOffset(1, true);

              i--;
            }
          }
        }
      } else {
        // indented
        // 缩进代码块
        if (indent >= CODE_INDENT) {
          parser.advanceOffset(CODE_INDENT, true);
        } else if (parser.blank) {
          parser.advanceNextNonspace();
        } else {
          return 1;
        }
      }
      return 0;
    },
    finalize: function (parser, block) {
      if (block.isFenced) {
        // 围栏代码块
        // fenced
        // first line becomes info string
        // 第一行成为信息字符串
        const content = block.string_content;
        const newlinePos = content.indexOf("\n");
        const firstLine = content.slice(0, newlinePos);
        const rest = content.slice(newlinePos + 1);

        block.info = unescapeString(firstLine.trim());
        block.literal = rest;
      } else {
        // indented
        // 缩进代码块
        const lines = block.string_content.split("\n");
        // Note that indented code block cannot be empty, so lines.length cannot be zero.
        // 请注意，缩进的代码块不能为空，因此 lines.length 不能为零
        while (/^[ \t]*$/.test(lines[lines.length - 1])) {
          lines.pop();
        }

        block.literal = lines.join("\n") + "\n";
        block.sourcepos[1][0] = block.sourcepos[0][0] + lines.length - 1;
        block.sourcepos[1][1] =
          block.sourcepos[0][1] + lines[lines.length - 1].length - 1;
      }

      block.string_content = ""; // allow GC
    },
    canContain: function () {
      return false;
    },
    acceptsLines: true,
  },
  html_block: {
    continue: function (parser, container) {
      return parser.blank &&
        (container.htmlBlockType === 6 || container.htmlBlockType === 7)
        ? 1
        : 0;
    },
    finalize: function (parser, block) {
      block.literal = block.string_content.replace(/\n$/, "");
      block.string_content = ""; // allow GC
    },
    canContain: function () {
      return false;
    },
    acceptsLines: true,
  },
  paragraph: {
    continue: function (parser) {
      return parser.blank ? 1 : 0;
    },
    finalize: function () {
      return;
    },
    canContain: function () {
      return false;
    },
    acceptsLines: true,
  },
};

// block start functions.  Return values:
// 0 = no match
// 1 = matched container, keep going
// 2 = matched leaf, no more block starts
const blockStarts: TBlockStartMatch[] = [
  // block quote
  function (parser) {
    if (
      !parser.indented &&
      peek(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN
    ) {
      parser.advanceNextNonspace();
      parser.advanceOffset(1, false);

      // optional following space
      if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
        parser.advanceOffset(1, true);
      }

      parser.closeUnmatchedBlocks();
      parser.addChild("block_quote", parser.nextNonspace);

      return 1;
    } else {
      return 0;
    }
  },

  // ATX heading
  function (parser) {
    let match: RegExpMatchArray | null;

    if (
      !parser.indented &&
      (match = parser.currentLine
        .slice(parser.nextNonspace)
        .match(reATXHeadingMarker))
    ) {
      // 匹配到 ATX 标题，前进到下一个非空白字符
      parser.advanceNextNonspace();
      // 跳过匹配到的 markdown 语法关键字的数量
      parser.advanceOffset(match[0].length, false);
      // 关闭所有未完成的块
      parser.closeUnmatchedBlocks();

      // 当前块作用域 this.tip 添加一个子节点
      const container = parser.addChild("heading", parser.nextNonspace);
      // 设置标题级别为 # 的数量
      container.level = match[0].trim().length; // number of #s

      // remove trailing ###s:
      // 删除尾随的 ###：
      container.string_content = parser.currentLine
        .slice(parser.offset)
        .replace(/^[ \t]*#+[ \t]*$/, "")
        .replace(/[ \t]+#+[ \t]*$/, "");

      // 前进到行尾
      parser.advanceOffset(parser.currentLine.length - parser.offset);
      return 2;
    } else {
      return 0;
    }
  },

  // Fenced code block
  function (parser) {
    let match: RegExpMatchArray | null;

    if (
      !parser.indented &&
      (match = parser.currentLine.slice(parser.nextNonspace).match(reCodeFence))
    ) {
      const fenceLength = match[0].length;

      parser.closeUnmatchedBlocks();

      const container = parser.addChild("code_block", parser.nextNonspace);
      container.isFenced = true;
      container.fenceLength = fenceLength;
      container.fenceChar = match[0][0];
      container.fenceOffset = parser.indent;

      parser.advanceNextNonspace();
      parser.advanceOffset(fenceLength, false);

      return 2;
    } else {
      return 0;
    }
  },

  // HTML block
  function (parser, container) {
    if (
      !parser.indented &&
      peek(parser.currentLine, parser.nextNonspace) === C_LESSTHAN
    ) {
      const s = parser.currentLine.slice(parser.nextNonspace);
      let blockType: number;

      for (blockType = 1; blockType <= 7; blockType++) {
        if (
          reHtmlBlockOpen[blockType].test(s) &&
          (blockType < 7 ||
            (container.type !== "paragraph" &&
              !(
                !parser.allClosed &&
                !parser.blank &&
                parser.tip.type === "paragraph"
              ))) // maybe lazy
        ) {
          parser.closeUnmatchedBlocks();

          // We don't adjust parser.offset;
          // spaces are part of the HTML block:
          const b = parser.addChild("html_block", parser.offset);
          b.htmlBlockType = blockType;

          return 2;
        }
      }
    }

    return 0;
  },

  // Setext heading
  function (parser, container) {
    let match: RegExpMatchArray | null;

    if (
      !parser.indented &&
      container.type === "paragraph" &&
      (match = parser.currentLine
        .slice(parser.nextNonspace)
        .match(reSetextHeadingLine))
    ) {
      parser.closeUnmatchedBlocks();

      // resolve reference link definitiosn
      // 解析参考链接定义
      let pos: number;
      while (
        peek(container.string_content, 0) === C_OPEN_BRACKET &&
        (pos = parser.inlineParser.parseReference(
          container.string_content,
          parser.refmap
        ))
      ) {
        container.string_content = container.string_content.slice(pos);
      }

      if (container.string_content.length > 0) {
        const heading = new MarkdownNode("heading", container.sourcepos);
        heading.level = match[0][0] === "=" ? 1 : 2;
        heading.string_content = container.string_content;

        container.insertAfter(heading);
        container.unlink();
        parser.tip = heading;

        parser.advanceOffset(parser.currentLine.length - parser.offset, false);
        return 2;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  },

  // thematic break
  function (parser) {
    if (
      !parser.indented &&
      reThematicBreak.test(parser.currentLine.slice(parser.nextNonspace))
    ) {
      parser.closeUnmatchedBlocks();
      parser.addChild("thematic_break", parser.nextNonspace);
      parser.advanceOffset(parser.currentLine.length - parser.offset, false);

      return 2;
    } else {
      return 0;
    }
  },

  // list item
  function (parser, container) {
    let data: IListData | null;

    if (
      (!parser.indented || container.type === "list") &&
      (data = parseListMarker(parser, container))
    ) {
      parser.closeUnmatchedBlocks();

      // add the list if needed
      // 如果需要添加列表
      if (parser.tip.type !== "list" || !listsMatch(container.listData, data)) {
        container = parser.addChild("list", parser.nextNonspace);
        container.listData = data;
      }

      // add the list item
      // 添加列表项
      container = parser.addChild("item", parser.nextNonspace);
      container.listData = data;

      return 1;
    } else {
      return 0;
    }
  },

  // indented code block
  function (parser) {
    if (parser.indented && parser.tip.type !== "paragraph" && !parser.blank) {
      // indented code
      parser.advanceOffset(CODE_INDENT, true);
      parser.closeUnmatchedBlocks();
      parser.addChild("code_block", parser.offset);

      return 2;
    } else {
      return 0;
    }
  },
];

class Document extends MarkdownNode {
  constructor() {
    super("document", [
      [1, 1],
      [0, 0],
    ]);
  }
}

// The Parser object.
class Parser {
  readonly blocks = blocks;
  readonly blockStarts = blockStarts;

  doc = new Document();
  tip = this.doc;
  oldtip = this.doc;

  currentLine = "";

  lineNumber = 0;

  offset = 0;
  column = 0;
  nextNonspace = 0;
  nextNonspaceColumn = 0;
  indent = 0;
  indented = false;
  blank = false;

  partiallyConsumedTab = false;
  allClosed = true;

  lastMatchedContainer = this.doc;

  refmap = {};

  lastLineLength = 0;

  inlineParser: InlineParser;

  options: IParserOptions;

  constructor(options: IParserOptions = {}) {
    this.options = options;
    this.inlineParser = new InlineParser(options);
  }

  findNextNonspace() {
    const currentLine = this.currentLine;

    let i = this.offset;
    let cols = this.column;
    let c: string;

    while ((c = currentLine.charAt(i)) !== "") {
      if (c === " ") {
        i++;
        cols++;
      } else if (c === "\t") {
        i++;
        cols += 4 - (cols % 4);
      } else {
        break;
      }
    }

    this.blank = c === "\n" || c === "\r" || c === "";
    this.nextNonspace = i;
    this.nextNonspaceColumn = cols;
    this.indent = this.nextNonspaceColumn - this.column;
    this.indented = this.indent >= CODE_INDENT;
  }

  advanceOffset(count: number, columns?: boolean) {
    const currentLine = this.currentLine;

    let charsToTab: number;
    let charsToAdvance: number;
    let c: string;

    while (count > 0 && (c = currentLine[this.offset])) {
      if (c === "\t") {
        charsToTab = 4 - (this.column % 4);

        if (columns) {
          this.partiallyConsumedTab = charsToTab > count;
          charsToAdvance = charsToTab > count ? count : charsToTab;
          this.column += charsToAdvance;
          this.offset += this.partiallyConsumedTab ? 0 : 1;
          count -= charsToAdvance;
        } else {
          this.partiallyConsumedTab = false;
          this.column += charsToTab;
          this.offset += 1;
          count -= 1;
        }
      } else {
        this.partiallyConsumedTab = false;
        this.offset += 1;
        this.column += 1; // assume ascii; block starts are ascii
        count -= 1;
      }
    }
  }

  advanceNextNonspace() {
    this.offset = this.nextNonspace;
    this.column = this.nextNonspaceColumn;
    this.partiallyConsumedTab = false;
  }

  // Add a line to the block at the tip.  We assume the tip can accept lines -- that check should be done before calling this.
  // 在块的尖端添加一条线，我们假设提示可以接受行 (应该在调用它之前完成检查)
  addLine() {
    if (this.partiallyConsumedTab) {
      // 跳过 tab
      this.offset += 1; // skip over tab

      // add space characters:
      // 添加空格（将 tab 转化为 4 个空格）
      const charsToTab = 4 - (this.column % 4);
      this.tip.string_content += " ".repeat(charsToTab);
    }

    // 设置当前块作用域的 string_content 内容
    this.tip.string_content += this.currentLine.slice(this.offset) + "\n";
  }

  // Add block of type tag as a child of the tip.  If the tip can't accept children, close and finalize it and try its parent, and so on til we find a block that can accept children.
  // 添加类型标记块作为 tip 的子项；如果 tip 无法接受子项，请关闭并完成它并尝试其父项，依此类推，直到找到可以接受子项的块
  addChild(tag: string, offset: number) {
    while (!this.blocks[this.tip.type].canContain(tag)) {
      this.finalize(this.tip, this.lineNumber - 1);
    }

    const column_number = offset + 1; // offset 0 = column 1

    const newBlock = new MarkdownNode(tag, [
      [this.lineNumber, column_number],
      [0, 0],
    ]);

    newBlock.string_content = "";

    this.tip.appendChild(newBlock);
    this.tip = newBlock;

    return newBlock;
  }

  // Analyze a line of text and update the document appropriately. We parse markdown text by calling this on each line of input, then finalizing the document.
  /** 分析一行文本并适当更新文档；通过在每一行输入字符串上调用它来解析 Markdown 文本，然后完成文档 */
  incorporateLine(ln: string) {
    let all_matched = true;
    // 节点类型
    let t: string;

    // 块容器
    let container: MarkdownNode | null = this.doc;
    // 备份块作用域
    this.oldtip = this.tip;

    // 重置
    this.offset = 0;
    this.column = 0;
    this.blank = false;
    this.partiallyConsumedTab = false;

    // 行号加一
    this.lineNumber += 1;

    // replace NUL characters for security
    // 替换所有不安全的码点 0 字符
    if (ln.indexOf("\u0000") !== -1) {
      ln = ln.replace(/\0/g, "\uFFFD");
    }

    // 设置当前行字符串
    this.currentLine = ln;

    // For each containing block, try to parse the associated line start. Bail out on failure: container will point to the last matching block. Set all_matched to false if not all containers match.
    // 对于每个包含块，尝试解析关联的行开头，失败时退出：容器将指向最后一个匹配的块；如果并非所有容器都匹配，将 all_matched 设置为 false
    let lastChild: MarkdownNode | null;
    // 从 doc 开始，向内部查找最后一个打开的块（未完成的、可能有后续内容的块）
    while ((lastChild = container.lastChild) && lastChild.open) {
      container = lastChild;

      this.findNextNonspace();

      switch (this.blocks[container.type].continue(this, container)) {
        // 匹配到一个容器块
        case 0: // we've matched, keep going
          break;
        // 没有匹配到一个容器块
        case 1: // we've failed to match a block
          all_matched = false;
          break;
        // 我们已经到达受防护代码关闭的行尾并且可以返回
        case 2: // we've hit end of line for fenced code close and can return
          return;
        default:
          throw "continue returned illegal value, must be 0, 1, or 2";
      }

      // 没有匹配到容器块则回退到父容器
      if (!all_matched) {
        container = container.parent; // back up to last matching block

        break;
      }
    }

    // TODO: new add
    if (container === null) {
      throw new Error("Not have a container.");
    }

    // container 是原备份的块作用域，说明内部的块是全部关闭的
    // 相当于没有未解析完成的块
    this.allClosed = container === this.oldtip;

    // 备份最后匹配的容器块
    this.lastMatchedContainer = container;

    // 匹配到的最后的块是否是叶块（除了段落外）
    let matchedLeaf =
      container.type !== "paragraph" && blocks[container.type].acceptsLines;

    // 运行块开始匹配函数
    /**
     * 尝试匹配:
     *   块引用
     *   ATX 标题
     *   代码围栏块
     *   HTML 块
     *   Setext 标题
     *   分割主题块
     *   列表项
     *   缩进代码块
     */
    const starts = this.blockStarts;
    const startsLen = starts.length;

    // Unless last matched container is a code block, try new container starts, adding children to the last matched container:
    // 除非最后一个匹配的容器是代码块，否则尝试启动新容器，将子容器添加到最后一个匹配的容器

    /**
     * 每次对一行匹配容器块，如果是缩进代码块，则后续内容都视为代码块范围，不需要在解析
     * 如果是叶块，则后续内容都视为叶块内容，不需要在解析
     * 如果是容器块，则块可以包含另一个块，以新的行偏移位置开始，继续解析内部块
     *
     * 1. 找到下一个非空白字符，记录相关信息
     * 2. 如果是缩进代码块或没有匹配到任何容器块，将偏移移动到下一个非空白字符，跳出循环
     * 3. 运行块开始解析函数
     *    1. 如果匹配到了容器块，将 container 设置为当前块作用域，跳出循环，继续执行上述步骤
     *    2. 如果匹配到了页块，将 container 设置为当前块作用域，matchedLeaf 设置为 true， 跳出循环
     */
    while (!matchedLeaf) {
      this.findNextNonspace();

      // this is a little performance optimization:
      // 性能优化，如果没有任何可能的容器块，前进到下一个非空白字符，并跳出循环
      if (!this.indented && !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
        this.advanceNextNonspace();
        break;
      }

      let i = 0;

      // 循环运行容器块解析函数（此处跳出到外层继续迭代）
      while (i < startsLen) {
        const res = starts[i](this, container);

        // 匹配到了容器块，container 设置为当前的块作用域（匹配到的容器块包含在当前块作用域中）
        if (res === 1) {
          container = this.tip;

          break;
          // 匹配到了叶块，container 设置为当前的块作用域（匹配到的容器块包含在当前块作用域中）
        } else if (res === 2) {
          container = this.tip;
          matchedLeaf = true;

          break;
        } else {
          i++;
        }
      }

      // 运行到此处表明无任何匹配的块，前进到下一个非空白字符
      if (i === startsLen) {
        // nothing matched
        this.advanceNextNonspace();

        break;
      }
    }

    // What remains at the offset is a text line.  Add the text to the appropriate container.
    // 保留在偏移处的是文本行，将文本添加到适当的容器中

    // First check for a lazy paragraph continuation:
    // 首先检查是否存在惰性段落延续（段落跨越两行（多行？），且未被其他块中断的被称为 [惰性段落]）
    if (!this.allClosed && !this.blank && this.tip.type === "paragraph") {
      // lazy paragraph continuation
      // 惰性段落的后续内容（运行到此处说明当前行前面有未被中断的段落行）
      this.addLine();
    } else {
      // not a lazy continuation
      // 不是惰性段落

      // finalize any blocks not matched
      // 完成任何不匹配的块
      this.closeUnmatchedBlocks();

      t = container.type;

      if (this.blocks[t].acceptsLines) {
        this.addLine();

        // if HtmlBlock, check for end condition
        if (
          t === "html_block" &&
          container.htmlBlockType >= 1 &&
          container.htmlBlockType <= 5 &&
          reHtmlBlockClose[container.htmlBlockType].test(
            this.currentLine.slice(this.offset)
          )
        ) {
          this.lastLineLength = ln.length;
          this.finalize(container, this.lineNumber);
        }
      } else if (this.offset < ln.length && !this.blank) {
        // 如果最终的偏移小于当前行的长度且未到行的结尾，则添加一个段落节点到当前块作用域 this.tip, 并设置 container 为 新的段落节点
        // create paragraph container for line
        container = this.addChild("paragraph", this.offset);

        // 前进到下一个非空白字符
        this.advanceNextNonspace();
        // 添加段落文本数据
        this.addLine();
      }
    }

    // 最后一行的长度设置为当前行的长度
    this.lastLineLength = ln.length;
  }

  // Finalize a block.  Close it and do any necessary postprocessing, e.g. creating string_content from strings, setting the 'tight' or 'loose' status of a list, and parsing the beginnings of paragraphs for reference definitions.  Reset the tip to the parent of the closed block.
  // 完成一个块；关闭它并进行任何必要的后处理，例如从字符串创建 string_content，设置列表的 “紧” 或 “松” 状态，并解析段落的开头以获取参考定义；将 tip 重置为闭合块的父级
  finalize(block: MarkdownNode, lineNumber: number) {
    // 即将回退的块，this.tip 回退到当前块作用域的父级
    const above = block.parent;
    // 当前的块被关闭，不再有后续内容追加
    block.open = false;
    block.sourcepos[1] = [lineNumber, this.lastLineLength];

    this.blocks[block.type].finalize(this, block);

    // TODO: new add
    // if (above === null) {
    //   throw new Error("Not have a above.");
    // }

    // 块作用域回退至当前块作用域的父级
    this.tip = above as MarkdownNode;
  }

  // Walk through a block & children recursively, parsing string content into inline content where appropriate.
  // 递归地遍历块和子级，在适当的情况下将字符串内容解析为内联内容
  processInlines(block: MarkdownNode) {
    let node: MarkdownNode;
    let event: IWalker | null;
    let t: string;

    const walker = block.walker();

    this.inlineParser.refmap = this.refmap;
    this.inlineParser.options = this.options;

    while ((event = walker.next())) {
      node = event.node;
      t = node.type;

      // 解析段落和标题中的内联内容
      if (!event.entering && (t === "paragraph" || t === "heading")) {
        this.inlineParser.parse(node);
      }
    }
  }

  // Finalize and close any unmatched blocks.
  // 完成并关闭任何不匹配的块
  closeUnmatchedBlocks() {
    // 如果存在未关闭的块
    if (!this.allClosed) {
      // finalize any blocks not matched
      // 完成任何不匹配的块
      // 迭代直到 oldtip 等于 lastMatchedContainer
      while (this.oldtip !== this.lastMatchedContainer) {
        // 备份 parent
        const parent = this.oldtip.parent;

        // 完成并关闭内部块
        this.finalize(this.oldtip, this.lineNumber - 1);

        // TODO: new add
        if (parent === null) {
          throw new Error("Not have a parent.");
        }

        this.oldtip = parent;
      }

      // 全部块都已关闭
      this.allClosed = true;
    }
  }

  // The main parsing function.  Returns a parsed document AST.
  parse(input: string) {
    // 构造根文档
    this.doc = new Document();

    // 设置当前块作用域
    this.tip = this.doc;

    // 链接引用的映射
    this.refmap = {};

    // 行数
    this.lineNumber = 0;
    // 当前最后行的长度
    this.lastLineLength = 0;
    // 当前偏移
    this.offset = 0;
    this.column = 0;

    // 最后匹配的块
    this.lastMatchedContainer = this.doc;
    this.currentLine = "";

    if (this.options.time) {
      console.time("preparing input");
    }

    // 切割为多行
    const lines = input.split(reLineEnding);

    let len = lines.length;

    // 如果最后一个字符是换行符，忽略最后一行
    if (input.charCodeAt(input.length - 1) === C_NEWLINE) {
      // ignore last blank line created by final newline
      len -= 1;
    }

    if (this.options.time) {
      console.timeEnd("preparing input");
    }

    if (this.options.time) {
      console.time("block parsing");
    }

    // 遍历分析行
    for (let i = 0; i < len; i++) {
      this.incorporateLine(lines[i]);
    }

    // 迭代，完成未完成的块 -> 冒泡到 document
    while (this.tip) {
      this.finalize(this.tip, len);
    }

    if (this.options.time) {
      console.timeEnd("block parsing");
    }

    if (this.options.time) {
      console.time("inline parsing");
    }

    // 解析行内
    this.processInlines(this.doc);

    if (this.options.time) {
      console.timeEnd("inline parsing");
    }

    return this.doc;
  }
}

export default Parser;
