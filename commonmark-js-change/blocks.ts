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

type TBlockStartMatch = (parser: Parser, node: MarkdownNode) => number;

const CODE_INDENT = 4;

const C_TAB = 9;
const C_NEWLINE = 10;
const C_GREATERTHAN = 62;
const C_LESSTHAN = 60;
const C_SPACE = 32;
const C_OPEN_BRACKET = 91;

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

const reHtmlBlockClose = [
  /./, // dummy for 0
  /<\/(?:script|pre|textarea|style)>/i,
  /-->/,
  /\?>/,
  />/,
  /\]\]>/,
];

const reThematicBreak =
  /^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/;

const reMaybeSpecial = /^[#`~*+_=<>0-9-]/;

const reNonSpace = /[^ \t\f\v\r\n]/;

const reBulletListMarker = /^[*+-]/;

const reOrderedListMarker = /^(\d{1,9})([.)])/;

const reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;

const reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;

const reClosingCodeFence = /^(?:`{3,}|~{3,})(?=[ \t]*$)/;

const reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;

const reLineEnding = /\r\n|\n|\r/;

// Returns true if string contains only space characters.
const isBlank = function (s: string) {
  return !reNonSpace.test(s);
};

const isSpaceOrTab = function (c: number) {
  return c === C_SPACE || c === C_TAB;
};

const peek = function (ln: string, pos: number) {
  if (pos < ln.length) {
    return ln.charCodeAt(pos);
  } else {
    return -1;
  }
};

// DOC PARSER

// These are methods of a Parser object, defined below.

// Returns true if block ends with a blank line.
const endsWithBlankLine = function (block: MarkdownNode) {
  return block.next && block.sourcepos[1][0] !== block.next.sourcepos[0][0] - 1;
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
    tight: true, // lists are tight by default
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
    data.delimiter = match[2];
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
  let event: IWalker | null;
  let node: MarkdownNode | null;

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
        if (item.next && endsWithBlankLine(item)) {
          block.listData.tight = false;
          break;
        }

        // recurse into children of list item, to see if there are
        // spaces between any of them:
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
        const content = block.string_content;
        const newlinePos = content.indexOf("\n");
        const firstLine = content.slice(0, newlinePos);
        const rest = content.slice(newlinePos + 1);

        block.info = unescapeString(firstLine.trim());
        block.literal = rest;
      } else {
        // indented
        const lines = block.string_content.split("\n");
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
      parser.advanceNextNonspace();
      parser.advanceOffset(match[0].length, false);
      parser.closeUnmatchedBlocks();

      const container = parser.addChild("heading", parser.nextNonspace);
      container.level = match[0].trim().length; // number of #s
      // remove trailing ###s:
      container.string_content = parser.currentLine
        .slice(parser.offset)
        .replace(/^[ \t]*#+[ \t]*$/, "")
        .replace(/[ \t]+#+[ \t]*$/, "");

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

  // Add a line to the block at the tip.  We assume the tip
  // can accept lines -- that check should be done before calling this.
  addLine() {
    if (this.partiallyConsumedTab) {
      this.offset += 1; // skip over tab

      // add space characters:
      const charsToTab = 4 - (this.column % 4);
      this.tip.string_content += " ".repeat(charsToTab);
    }

    this.tip.string_content += this.currentLine.slice(this.offset) + "\n";
  }

  // Add block of type tag as a child of the tip.  If the tip can't
  // accept children, close and finalize it and try its parent,
  // and so on til we find a block that can accept children.
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

  // Analyze a line of text and update the document appropriately.
  // We parse markdown text by calling this on each line of input,
  // then finalizing the document.
  incorporateLine(ln: string) {
    let all_matched = true;
    let t: string;

    let container: MarkdownNode | null = this.doc;
    this.oldtip = this.tip;

    this.offset = 0;
    this.column = 0;
    this.blank = false;
    this.partiallyConsumedTab = false;
    this.lineNumber += 1;

    // replace NUL characters for security
    if (ln.indexOf("\u0000") !== -1) {
      ln = ln.replace(/\0/g, "\uFFFD");
    }

    this.currentLine = ln;

    // For each containing block, try to parse the associated line start.
    // Bail out on failure: container will point to the last matching block.
    // Set all_matched to false if not all containers match.
    let lastChild: MarkdownNode | null;
    while ((lastChild = container.lastChild) && lastChild.open) {
      container = lastChild;

      this.findNextNonspace();

      switch (this.blocks[container.type].continue(this, container)) {
        case 0: // we've matched, keep going
          break;
        case 1: // we've failed to match a block
          all_matched = false;
          break;
        case 2: // we've hit end of line for fenced code close and can return
          return;
        default:
          throw "continue returned illegal value, must be 0, 1, or 2";
      }

      if (!all_matched) {
        container = container.parent; // back up to last matching block

        break;
      }
    }

    // TODO: new add
    if (container === null) {
      throw new Error("Not have a container.");
    }

    this.allClosed = container === this.oldtip;
    this.lastMatchedContainer = container;

    let matchedLeaf =
      container.type !== "paragraph" && blocks[container.type].acceptsLines;

    const starts = this.blockStarts;
    const startsLen = starts.length;

    // Unless last matched container is a code block, try new container starts,
    // adding children to the last matched container:
    while (!matchedLeaf) {
      this.findNextNonspace();

      // this is a little performance optimization:
      if (!this.indented && !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
        this.advanceNextNonspace();
        break;
      }

      let i = 0;
      while (i < startsLen) {
        const res = starts[i](this, container);

        if (res === 1) {
          container = this.tip;

          break;
        } else if (res === 2) {
          container = this.tip;
          matchedLeaf = true;

          break;
        } else {
          i++;
        }
      }

      if (i === startsLen) {
        // nothing matched
        this.advanceNextNonspace();

        break;
      }
    }

    // What remains at the offset is a text line.  Add the text to the
    // appropriate container.

    // First check for a lazy paragraph continuation:
    if (!this.allClosed && !this.blank && this.tip.type === "paragraph") {
      // lazy paragraph continuation
      this.addLine();
    } else {
      // not a lazy continuation

      // finalize any blocks not matched
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
        // create paragraph container for line
        container = this.addChild("paragraph", this.offset);

        this.advanceNextNonspace();
        this.addLine();
      }
    }

    this.lastLineLength = ln.length;
  }

  // Finalize a block.  Close it and do any necessary postprocessing,
  // e.g. creating string_content from strings, setting the 'tight'
  // or 'loose' status of a list, and parsing the beginnings
  // of paragraphs for reference definitions.  Reset the tip to the
  // parent of the closed block.
  finalize(block: MarkdownNode, lineNumber: number) {
    const above = block.parent;
    block.open = false;
    block.sourcepos[1] = [lineNumber, this.lastLineLength];

    this.blocks[block.type].finalize(this, block);

    // TODO: new add
    // if (above === null) {
    //   throw new Error("Not have a above.");
    // }

    this.tip = above as MarkdownNode;
  }

  // Walk through a block & children recursively, parsing string content
  // into inline content where appropriate.
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

      if (!event.entering && (t === "paragraph" || t === "heading")) {
        this.inlineParser.parse(node);
      }
    }
  }

  // Finalize and close any unmatched blocks.
  closeUnmatchedBlocks() {
    if (!this.allClosed) {
      // finalize any blocks not matched
      while (this.oldtip !== this.lastMatchedContainer) {
        const parent = this.oldtip.parent;

        this.finalize(this.oldtip, this.lineNumber - 1);

        // TODO: new add
        if (parent === null) {
          throw new Error("Not have a parent.");
        }

        this.oldtip = parent;
      }

      this.allClosed = true;
    }
  }

  // The main parsing function.  Returns a parsed document AST.
  parse(input: string) {
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

    const lines = input.split(reLineEnding);

    let len = lines.length;

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

    for (let i = 0; i < len; i++) {
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
