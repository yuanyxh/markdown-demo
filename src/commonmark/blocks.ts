import MarkdownNode from "./node";
import { unescapeString, OPENTAG, CLOSETAG } from "./common";
import InlineParser from "./inlines";
import {
  IListData,
  IParserBlockRun,
  IParserOptions,
  IRefmap,
  TMarkdownNodeType,
  TNodeWalker,
  TParserBlockStartsFun,
} from "./types";

/** 代码缩进 */
const CODE_INDENT = 4;

/** tab 的码点 */
const C_TAB = 9;
/** \n 的码点 */
const C_NEWLINE = 10;
/** 大于号的码点 */
const C_GREATERTHAN = 62;
/** 小于号的码点 */
const C_LESSTHAN = 60;
/** 空格的码点 */
const C_SPACE = 32;
/** [ 的码点 */
const C_OPEN_BRACKET = 91;

/** html 块的开始正则匹配 */
const reHtmlBlockOpen = [
  /./, // dummy for 0
  /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
  /^<!--/,
  /^<[?]/,
  /^<![A-Za-z]/,
  /^<!\[CDATA\[/,
  /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
  /** 匹配 html 实体字符? */
  new RegExp("^(?:" + OPENTAG + "|" + CLOSETAG + ")\\s*$", "i"),
];

/** html 块的闭合正则匹配 */
const reHtmlBlockClose = [
  /./, // dummy for 0
  /<\/(?:script|pre|textarea|style)>/i,
  /-->/,
  /\?>/,
  />/,
  /\]\]>/,
];

/** 主题分割的正则匹配 */
const reThematicBreak =
  /^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/;

/** 匹配以 “#”、“`”、“~”、“*”、“+”、“_”、“=”、“>”、“<”、数字 “0” 到 “9” 或者 “-” 开头的字符串 */
const reMaybeSpecial = /^[#`~*+_=<>0-9-]/;

/** 检测包含除空白字符外的其他字符的行 */
const reNonSpace = /[^ \t\f\v\r\n]/;

/** 无序列表的匹配 */
const reBulletListMarker = /^[*+-]/;

/** 有序列表的匹配 */
const reOrderedListMarker = /^(\d{1,9})([.)])/;

/** atx 标题的匹配 */
const reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;

/** 代码块开始的匹配 */
const reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;

/** 代码块结束的匹配 */
const reClosingCodeFence = /^(?:`{3,}|~{3,})(?=[ \t]*$)/;

/** setext 标题行的匹配 */
const reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;

/** 行尾的匹配，换行符 */
const reLineEnding = /\r\n|\n|\r/;

/** 如果字符串仅包含空格字符，则返回 true */
const isBlank = function (s: string) {
  return !reNonSpace.test(s);
};

/** 空格或 tab */
const isSpaceOrTab = function (c: number) {
  return c === C_SPACE || c === C_TAB;
};

/** 返回字符的码点或 -1 */
const peek = function (ln: string, pos: number) {
  if (pos < ln.length) {
    return ln.charCodeAt(pos);
  } else {
    return -1;
  }
};

// 文档解析

// 下面是 Parser 对象的方法，定义如下：

/** 如果块以空行结束则返回 true */
const endsWithBlankLine = function (block: MarkdownNode) {
  return (
    // 当前块的结束行号不等于下一个节点的开始行号上一行
    block.next && block.sourcepos[1][0] !== block.next.sourcepos[0][0] - 1
  );
};

// Parse a list marker and return data on the marker (type,
// start, delimiter, bullet character, padding) or null.
const parseListMarker = function (parser: Parser, container: MarkdownNode) {
  const rest = parser.currentLine.slice(parser.nextNonspace);
  let match: RegExpMatchArray | null;
  let nextc: number;
  let spacesStartCol: number;
  let spacesStartOffset: number;

  const data: IListData = {
    type: null,
    tight: true, // lists are tight by default
    bulletChar: null,
    start: null,
    delimiter: null,
    padding: null,
    markerOffset: parser.indent,
  };

  if (parser.indent >= 4) {
    return null;
  }

  if ((match = rest.match(reBulletListMarker))) {
    data.type = "bullet";
    data.bulletChar = match[0][0];
  } else if (
    (match = rest.match(reOrderedListMarker)) &&
    (container.type !== "paragraph" || Number(match[1]) === 1)
  ) {
    data.type = "ordered";
    data.start = parseInt(match[1]);
    data.delimiter = match[2] as IListData["delimiter"];
  } else {
    return null;
  }

  // make sure we have spaces after
  nextc = peek(parser.currentLine, parser.nextNonspace + match[0].length);

  if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
    return null;
  }

  // if it interrupts paragraph, make sure first line isn't blank
  if (
    container.type === "paragraph" &&
    !parser.currentLine
      .slice(parser.nextNonspace + match[0].length)
      .match(reNonSpace)
  ) {
    return null;
  }

  // we've got a match! advance offset and calculate padding
  parser.advanceNextNonspace(); // to start of marker
  parser.advanceOffset(match[0].length, true); // to end of marker

  spacesStartCol = parser.column;
  spacesStartOffset = parser.offset;

  do {
    parser.advanceOffset(1, true);
    nextc = peek(parser.currentLine, parser.offset);
  } while (parser.column - spacesStartCol < 5 && isSpaceOrTab(nextc));

  const blank_item = peek(parser.currentLine, parser.offset) === -1;
  const spaces_after_marker = parser.column - spacesStartCol;

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

// Returns true if the two list items are of the same type,
// with the same delimiter and bullet character.  This is used
// in agglomerating list items into lists.
const listsMatch = function (list_data: IListData, item_data: IListData) {
  return (
    list_data.type === item_data.type &&
    list_data.delimiter === item_data.delimiter &&
    list_data.bulletChar === item_data.bulletChar
  );
};

// Remove link reference definitions from given tree.
const removeLinkReferenceDefinitions = function (
  parser: Parser,
  tree: MarkdownNode
) {
  let event: TNodeWalker, node: MarkdownNode;

  const walker = tree.walker();
  const emptyNodes: MarkdownNode[] = [];

  while ((event = walker.next())) {
    node = event.node;

    if (event.entering && node.type === "paragraph") {
      let pos: number;
      let hasReferenceDefs = false;

      // Try parsing the beginning as link reference definitions;
      // Note that link reference definitions must be the beginning of a
      // paragraph node since link reference definitions cannot interrupt
      // paragraphs.
      while (
        peek(node.string_content!, 0) === C_OPEN_BRACKET &&
        (pos = parser.inlineParser.parseReference(
          node.string_content!,
          parser.refmap
        ))
      ) {
        const removedText = node.string_content!.slice(0, pos);

        node.string_content = node.string_content!.slice(pos);

        hasReferenceDefs = true;

        const lines = removedText.split("\n");

        // -1 for final newline.
        node.sourcepos[0][0] += lines.length - 1;
      }

      if (hasReferenceDefs && isBlank(node.string_content!)) {
        emptyNodes.push(node);
      }
    }
  }

  for (node of emptyNodes) {
    node.unlink();
  }
};

const blocks: {
  [key: string]: IParserBlockRun;
} = {
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
        // 检查以空行结尾的非最终列表项，
        /**
         * 1. xx
         *
         * 2. xx
         *
         * 这样的列表是松散的，非紧凑的
         */
        if (item.next && endsWithBlankLine(item)) {
          block.listData.tight = false;

          break;
        }

        // 递归到列表项的子项，看看是否有其中任何一个之间的空格：
        /**
         * 子列表的空行也会导致当前列表视为松散列表
         */
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

      block.sourcepos[1] = block.lastChild!.sourcepos[1];
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
        if (container.firstChild == null) {
          // 空列表项后的空行
          return 1;
        } else {
          parser.advanceNextNonspace();
        }
      } else if (
        parser.indent >=
        container.listData.markerOffset + container.listData.padding!
      ) {
        parser.advanceOffset(
          container.listData.markerOffset + container.listData.padding!,
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
        // 空列表项
        block.sourcepos[1][0] = block.sourcepos[0][0];
        block.sourcepos[1][1] =
          block.listData.markerOffset + block.listData.padding!;
      }

      return;
    },
    canContain: function (t) {
      return t !== "item";
    },
    acceptsLines: false,
  },

  heading: {
    /** 标题不能大于 1 行，不能匹配一个块 */
    continue: function () {
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

      if (container.isFenced) {
        // fenced
        const match =
          indent <= 3 &&
          ln.charAt(parser.nextNonspace) === container.fenceChar &&
          ln.slice(parser.nextNonspace).match(reClosingCodeFence);

        if (match && match[0].length >= container.fenceLength) {
          // closing fence - we're at end of line, so we can return
          parser.lastLineLength = parser.offset + indent + match[0].length;
          parser.finalize(container, parser.lineNumber);

          return 2;
        } else {
          // skip optional spaces of fence offset
          let i = container.fenceOffset!;

          while (i > 0 && isSpaceOrTab(peek(ln, parser.offset))) {
            parser.advanceOffset(1, true);

            i--;
          }
        }
      } else {
        // indented
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
        // fenced
        // first line becomes info string
        const content = block.string_content!;
        const newlinePos = content.indexOf("\n");
        const firstLine = content.slice(0, newlinePos);
        const rest = content.slice(newlinePos + 1);

        block.info = unescapeString(firstLine.trim());
        block.literal = rest;
      } else {
        // indented
        const lines = block.string_content!.split("\n");

        // Note that indented code block cannot be empty, so
        // lines.length cannot be zero.
        while (/^[ \t]*$/.test(lines[lines.length - 1])) {
          lines.pop();
        }

        block.literal = lines.join("\n") + "\n";
        block.sourcepos[1][0] = block.sourcepos[0][0] + lines.length - 1;
        block.sourcepos[1][1] =
          block.sourcepos[0][1] + lines[lines.length - 1].length - 1;
      }

      block.string_content = null; // allow GC
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
      block.literal = block.string_content!.replace(/\n$/, "");
      block.string_content = null; // allow GC
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

/**
 * 块启动功能。  返回值：
 * 0 = 不匹配
 * 1 = 匹配到了容器，继续
 * 2 = 匹配到了叶块，不再有块开始
 */
const blockStarts: TParserBlockStartsFun[] = [
  // blockquote 解析
  function (parser) {
    // 如果行首空白字符不满足进入代码块，且第一个非空白字符为 > 则返回 1
    if (
      !parser.indented &&
      peek(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN
    ) {
      // 前进到下一个非空白字符
      parser.advanceNextNonspace();

      // 前进一位，首个非空白字符的下一个字符
      parser.advanceOffset(1, false);

      // 可选的后续空格或 tab，如 # ，> ，- ，
      if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
        // 前进一位，跳过可选的空白字符或 tab
        parser.advanceOffset(1, true);
      }

      // 完成并关闭不匹配的块
      parser.closeUnmatchedBlocks();

      // 添加 blockquote child
      parser.addChild("block_quote", parser.nextNonspace);

      return 1;
    } else {
      return 0;
    }
  },

  /** atx 标题匹配 */
  function (parser) {
    let match: RegExpMatchArray | null;

    // 没有进入代码块，且 atx 正则匹配
    // ### , # 后必须跟至少一个空白字符，或不跟任何字符
    if (
      !parser.indented &&
      (match = parser.currentLine
        .slice(parser.nextNonspace)
        .match(reATXHeadingMarker))
    ) {
      // 前进到非空白字符
      parser.advanceNextNonspace();
      // 前进匹配的 markdown 标点长度
      parser.advanceOffset(match[0].length, false);
      // 关闭所有未关闭不匹配的块
      parser.closeUnmatchedBlocks();

      const container = parser.addChild("heading", parser.nextNonspace);
      container.level = match[0].trim().length; // number of #s

      // 删除尾随的 # 号
      // 当前 string_content 为删除无效尾随空格后的内容
      container.string_content = parser.currentLine
        .slice(parser.offset)
        .replace(/^[ \t]*#+[ \t]*$/, "")
        .replace(/[ \t]+#+[ \t]*$/, "");

      // 前进到末尾
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
          b.htmlBlockType = blockType as MarkdownNode["htmlBlockType"];

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
      let pos: number;

      while (
        peek(container.string_content!, 0) === C_OPEN_BRACKET &&
        (pos = parser.inlineParser.parseReference(
          container.string_content!,
          parser.refmap
        ))
      ) {
        container.string_content = container.string_content!.slice(pos);
      }

      if (container.string_content!.length > 0) {
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
      if (parser.tip.type !== "list" || !listsMatch(container.listData, data)) {
        container = parser.addChild("list", parser.nextNonspace);
        container.listData = data;
      }

      // add the list item
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

class Parser {
  blocks = blocks;

  blockStarts = blockStarts;

  /** 选项 */
  options: IParserOptions = {};

  /** 文档根 */
  doc: MarkdownNode = new Document();

  /** 当前的顶端，doc -> 容器块 -> 其他块 */
  tip = this.doc;

  /** 每次分析一行时重置为 this.tip */
  oldtip = this.doc;

  lastMatchedContainer: MarkdownNode | null = this.doc;

  /** 当前行字符串 */
  currentLine = "";

  /** 当前行号, 每次分析一行时 +1 */
  lineNumber = 0;

  /** 行偏移，字符计，\t 计 4 空白字符，每次分析一行时重置为 0 */
  offset = 0;

  /**
   * 列偏移，4 字符一列，\t 计 4 空白字符
   * 始终是 4 的倍数，只有在空白字符数能整除 4 时，才会前进到下一列
   * 每次分析一行时重置为 0
   * */
  column = 0;

  /** 当前行首到当前行非空白字符的位置 */
  nextNonspace = 0;

  /** 当前行首到当前行非空白字符的列组 */
  nextNonspaceColumn = 0;

  /** 当前行缩进 */
  indent = 0;

  /** 当前行首空白字符数是否可以进入代码块范围 (大于等于 4) */
  indented = false;

  /** 当前行是否到行尾，每次分析一行时重置为 false */
  blank = false;

  /** tab 字符的一部分是否作为空白的一部分? 每次分析一行 或 advanceNextNonspace 时重置为 false */
  partiallyConsumedTab = false;

  allClosed = true;

  refmap: {
    [key: string]: IRefmap;
  } = {};

  lastLineLength = 0;

  inlineParser: InlineParser;

  constructor(options?: IParserOptions) {
    this.options = options || {};
    this.inlineParser = new InlineParser(options);
  }

  /**
   *
   * @description 查找当前行下一个非空白字符，并记录是否到行尾、下一个非空白字符的位置、缩进、是否有 4 个 空格 (4 个空格进入代码块范围)
   */
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

  /**
   * this.offset 前进偏移量
   */
  advanceOffset(count: number, columns: boolean = false) {
    const currentLine = this.currentLine;

    let charsToTab: number;
    let charsToAdvance: number;
    let c: string;

    while (count > 0 && (c = currentLine[this.offset])) {
      if (c === "\t") {
        charsToTab = 4 - (this.column % 4);

        if (columns) {
          // 是否消费了 tab 作为空白字符
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

  /**
   * 将 offset 推进到 nextNonspace 非空白字符位置
   * 将 column 推进到 nextNonspaceColumn 非空白字符所在列位置
   * partiallyConsumedTab 设置为 false
   */
  advanceNextNonspace() {
    this.offset = this.nextNonspace;
    this.column = this.nextNonspaceColumn;
    this.partiallyConsumedTab = false;
  }

  /**
   * 在块的尖端添加一行 (\n)，我们假设可以接受 Line —— 应该在调用此之前完成检查
   */
  addLine() {
    if (this.partiallyConsumedTab) {
      this.offset += 1; // skip over tab
      // add space characters:
      const charsToTab = 4 - (this.column % 4);
      this.tip.string_content += " ".repeat(charsToTab);
    }

    this.tip.string_content += this.currentLine.slice(this.offset) + "\n";
  }

  /**
   * 添加类型标记块作为提示的子项
   * 如果提示不能接受子级，关闭并完成它并尝试其父级，依此类推，直到我们找到一个可以容纳孩子的街区
   */
  addChild(tag: TMarkdownNodeType, offset: number) {
    // 是否可以包含指定 type 的 node
    while (!this.blocks[this.tip.type].canContain(tag)) {
      this.finalize(this.tip, this.lineNumber - 1);
    }

    // 列位置为非空白字符偏移 + 1
    const column_number = offset + 1; // offset 0 = column 1

    // 创建新块
    const newBlock = new MarkdownNode(tag, [
      [this.lineNumber, column_number],
      [0, 0],
    ]);

    /** 新块的 string_content "" */
    newBlock.string_content = "";

    /** 当前的头部块添加新块 */
    this.tip.appendChild(newBlock);

    // tip 设置为新块，进入新块的解析
    this.tip = newBlock;

    return newBlock;
  }

  /**
   *
   * @description 分析一行文本并适当更新文档, 我们通过在每行输入上调用它来解析 Markdown 文本，然后完成文件
   * @param {string} ln
   * @returns
   */
  incorporateLine(ln: string) {
    let all_matched = true;
    let t: TMarkdownNodeType;
    let container: MarkdownNode | null = this.doc;

    this.oldtip = this.tip;
    this.offset = 0;
    this.column = 0;
    this.blank = false;
    this.partiallyConsumedTab = false;
    this.lineNumber += 1;

    // 为了安全起见替换 NUL 字符
    if (ln.indexOf("\u0000") !== -1) {
      ln = ln.replace(/\0/g, "\uFFFD");
    }

    this.currentLine = ln;

    /**
     * 对于每个包含块，尝试解析关联的行开头，失败时退出：容器将指向最后一个匹配的块
     * 如果并非所有容器都匹配，请将 all_matched 设置为 false
     */
    let lastChild: MarkdownNode | null;

    // 当初次进入时，this.doc 根文档不包含任何子节点，此循环跳过
    while ((lastChild = container.lastChild) && lastChild.open) {
      container = lastChild;

      // 记录当前行首空白字符，缩进，是否换行等信息
      this.findNextNonspace();

      switch (this.blocks[container.type].continue(this, container)) {
        case 0: // 我们已经匹配了，继续
          break;
        case 1: // 我们无法匹配一个块
          all_matched = false;
          break;
        case 2: // 我们已经到达受防护代码关闭的行尾并且可以返回
          return;
        default:
          throw "continue returned illegal value, must be 0, 1, or 2";
      }

      if (!all_matched) {
        container = container.parent; // 备份到最后一个匹配块

        break;
      }
    }

    //
    this.allClosed = container === this.oldtip;

    //
    this.lastMatchedContainer = container;

    let matchedLeaf =
      container!.type !== "paragraph" && blocks[container!.type].acceptsLines;

    const starts = this.blockStarts;
    const startsLen = starts.length;

    /**
     * 除非最后一个匹配的容器是代码块，否则尝试启动新容器，将子项添加到最后一个匹配的容器：
     */
    while (!matchedLeaf) {
      // 记录当前行首空白字符，缩进，是否换行等信息
      this.findNextNonspace();

      // 这是一些性能优化：

      // 如果当前行首空白数无法进入代码块且删除行首空格后的字符串不以
      // “#”、“`”、“~”、“*”、“+”、“_”、“=”、“>”、“<”、数字 “0” 到 “9”、 “-” 开头

      // 一行首，没有四个空白，且不以 markdown 标点字符开头则进入 advanceNextNonspace 优化
      if (!this.indented && !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
        // 将 this.offset、 this.column 前进至下一个非空白字符
        // 将 partiallyConsumedTab 重置为 false
        this.advanceNextNonspace();

        break;
      }

      // 运行所有块开始解析函数，当解析函数返回 1 或 2 时跳出循环
      let i = 0;
      while (i < startsLen) {
        const res = starts[i](this, container!);

        if (res === 1) {
          // 匹配到了一个块，此处 this.tip 指向新块，container 为新块
          container = this.tip;
          break;
        } else if (res === 2) {
          // 匹配到了一个叶块，此处 this.tip 指向新的叶块，container 为新叶块
          container = this.tip;

          // 匹配到叶子块，跳出循环
          matchedLeaf = true;
          break;
        } else {
          i++;
        }
      }

      if (i === startsLen) {
        // 运行到此处时表明没有匹配的块，跳出循环
        this.advanceNextNonspace();
        break;
      }
    }

    // 保留在偏移处的是文本行, 将文本添加到合适的容器

    // 首先检查是否存在惰性段落延续：
    if (!this.allClosed && !this.blank && this.tip.type === "paragraph") {
      // 添加一行
      this.addLine();
    } else {
      // 不是懒惰的延续

      // 完成任何不匹配的块
      this.closeUnmatchedBlocks();

      t = container!.type;

      // 如果接受 line
      if (this.blocks[t].acceptsLines) {
        // 添加一行
        this.addLine();

        // 如果 html_block，检查结束条件是否匹配
        if (
          t === "html_block" &&
          container!.htmlBlockType! >= 1 &&
          container!.htmlBlockType! <= 5 &&
          reHtmlBlockClose[container!.htmlBlockType!].test(
            this.currentLine.slice(this.offset)
          )
        ) {
          // 最后一行的长度为当前行的长度
          this.lastLineLength = ln.length;

          this.finalize(container!, this.lineNumber);
        }
      } else if (this.offset < ln.length && !this.blank) {
        // 如果偏移未超过当前行的长度且未换行

        // 为行文本创建段落容器
        container = this.addChild("paragraph", this.offset);

        // 回到首个非空白字符位置
        this.advanceNextNonspace();
        // 添加一行
        this.addLine();
      }
    }

    // 最后一行的长度为当前行的长度
    this.lastLineLength = ln.length;
  }

  /**
   * 完成一个块
   * 关闭它并进行任何必要的后处理，例如从字符串创建 string_content
   * 设置列表的 'tight' 或 'loose' 状态，并解析开头
   * 参考定义的段落
   * 将 tip 重置为封闭块的父级
   */
  finalize(block: MarkdownNode, lineNumber: number) {
    const above = block.parent!;
    block.open = false;
    block.sourcepos[1] = [lineNumber, this.lastLineLength];

    this.blocks[block.type].finalize(this, block);

    this.tip = above;
  }

  // Walk through a block & children recursively, parsing string content
  // into inline content where appropriate.
  processInlines(block: MarkdownNode) {
    let node: MarkdownNode;
    let event: TNodeWalker;
    let t: TMarkdownNodeType;

    const walker = block.walker();
    this.inlineParser.refmap = this.refmap;
    this.inlineParser.options = this.options;

    while ((event = walker.next())) {
      node = event.node;
      t = node.type;

      if (!event.entering && (t === "paragraph" || t === "heading")) {
        this.inlineParser.parse(node);
      }
    }
  }

  /** 完成并关闭任何不匹配的块 */
  closeUnmatchedBlocks() {
    if (!this.allClosed) {
      // 完成任何不匹配的块
      while (this.oldtip !== this.lastMatchedContainer) {
        const parent = this.oldtip.parent!;

        this.finalize(this.oldtip, this.lineNumber - 1);

        this.oldtip = parent;
      }

      this.allClosed = true;
    }
  }

  parse(input: string) {
    // 构造文档
    this.doc = new Document();

    this.tip = this.doc;

    this.refmap = {};

    this.lineNumber = 0;

    this.lastLineLength = 0;

    this.offset = 0;

    this.column = 0;

    this.lastMatchedContainer = this.doc;

    this.currentLine = "";

    if (this.options.time) {
      console.time("preparing input");
    }

    /** 以 \n 切割为多行 */
    const lines = input.split(reLineEnding);

    /** 总行数 */
    let len = lines.length;

    if (input.charCodeAt(input.length - 1) === C_NEWLINE) {
      // 忽略最后一个换行符创建的最后一个空白行
      len -= 1;
    }

    if (this.options.time) {
      console.timeEnd("preparing input");
    }

    if (this.options.time) {
      console.time("block parsing");
    }

    // 遍历行
    for (var i = 0; i < len; i++) {
      this.incorporateLine(lines[i]);
    }

    while (this.tip) {
      this.finalize(this.tip, len);
    }

    if (this.options.time) {
      console.timeEnd("block parsing");
    }

    if (this.options.time) {
      console.time("inline parsing");
    }

    this.processInlines(this.doc);

    if (this.options.time) {
      console.timeEnd("inline parsing");
    }

    return this.doc;
  }
}

export default Parser;
