import { Block, HtmlBlock, Paragraph } from "../node";
import {
  AbstractBlockParser,
  AbstractBlockParserFactory,
  BlockContinue,
  BlockStart,
  MatchedBlockParser,
  ParserState,
  SourceLine,
} from "../parser";
import BlockContent from "./BlockContent";

class Factory extends AbstractBlockParserFactory {
  public tryStart(
    state: ParserState,
    matchedBlockParser: MatchedBlockParser
  ): BlockStart | null {
    const nextNonSpace = state.getNextNonSpaceIndex();
    const line = state.getLine().getContent();

    if (state.getIndent() < 4 && line.charAt(nextNonSpace) === "<") {
      for (let blockType = 1; blockType <= 7; blockType++) {
        // Type 7 can not interrupt a paragraph (not even a lazy one)
        if (
          blockType === 7 &&
          (matchedBlockParser.getMatchedBlockParser().getBlock() instanceof
            Paragraph ||
            state.getActiveBlockParser().canHaveLazyContinuationLines())
        ) {
          continue;
        }

        const opener = HtmlBlockParser.BLOCK_PATTERNS[blockType][0];
        const closer = HtmlBlockParser.BLOCK_PATTERNS[blockType][1];
        const matches = opener?.exec(line.substring(nextNonSpace, line.length));

        if (matches) {
          return BlockStart.of(new HtmlBlockParser(closer)).atIndex(
            state.getIndex()
          );
        }
      }
    }
    return BlockStart.none();
  }
}

class HtmlBlockParser extends AbstractBlockParser {
  private static readonly TAGNAME: string = "[A-Za-z][A-Za-z0-9-]*";
  private static readonly ATTRIBUTENAME: string = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
  private static readonly UNQUOTEDVALUE: string = "[^\"'=<>`\\x00-\\x20]+";
  private static readonly SINGLEQUOTEDVALUE: string = "'[^']*'";
  private static readonly DOUBLEQUOTEDVALUE: string = '"[^"]*"';
  private static readonly ATTRIBUTEVALUE: string =
    "(?:" +
    HtmlBlockParser.UNQUOTEDVALUE +
    "|" +
    HtmlBlockParser.SINGLEQUOTEDVALUE +
    "|" +
    HtmlBlockParser.DOUBLEQUOTEDVALUE +
    ")";
  private static readonly ATTRIBUTEVALUESPEC: string =
    "(?:" + "\\s*=" + "\\s*" + HtmlBlockParser.ATTRIBUTEVALUE + ")";
  private static readonly ATTRIBUTE: string =
    "(?:" +
    "\\s+" +
    HtmlBlockParser.ATTRIBUTENAME +
    HtmlBlockParser.ATTRIBUTEVALUESPEC +
    "?)";

  private static readonly OPENTAG: string =
    "<" + HtmlBlockParser.TAGNAME + HtmlBlockParser.ATTRIBUTE + "*" + "\\s*/?>";
  private static readonly CLOSETAG: string =
    "</" + HtmlBlockParser.TAGNAME + "\\s*[>]";

  public static readonly BLOCK_PATTERNS = [
    [null, null], // not used (no type 0)
    [
      /^<(?:script|pre|style|textarea)(?:\\s|>|$)/i,
      /<\/(?:script|pre|style|textarea)>/i,
    ],
    [/^<!--/, /-->/],
    [/^<[?]/, /\\?>/],
    [/^<![A-Z]/, />/],
    [/^<!\[CDATA\[/, /\]\]>/],
    [
      new RegExp(
        "^</?(?:" +
          "address|article|aside|" +
          "base|basefont|blockquote|body|" +
          "caption|center|col|colgroup|" +
          "dd|details|dialog|dir|div|dl|dt|" +
          "fieldset|figcaption|figure|footer|form|frame|frameset|" +
          "h1|h2|h3|h4|h5|h6|head|header|hr|html|" +
          "iframe|" +
          "legend|li|link|" +
          "main|menu|menuitem|" +
          "nav|noframes|" +
          "ol|optgroup|option|" +
          "p|param|" +
          "search|section|summary|" +
          "table|tbody|td|tfoot|th|thead|title|tr|track|" +
          "ul" +
          ")(?:\\s|[/]?[>]|$)",
        "i"
      ),
      null, // terminated by blank line
    ],
    [
      new RegExp(
        "^(?:" +
          HtmlBlockParser.OPENTAG +
          "|" +
          HtmlBlockParser.CLOSETAG +
          ")\\s*$",
        "i"
      ),
      null, // terminated by blank line
    ],
  ];

  private readonly block = new HtmlBlock();
  private readonly closingPattern: RegExp | null;

  private finished: boolean = false;
  private content: BlockContent | null = new BlockContent();

  public constructor(closingPattern: RegExp | null = null) {
    super();
    this.closingPattern = closingPattern;
  }

  public getBlock(): Block {
    return this.block;
  }

  public tryContinue(state: ParserState): BlockContinue | null {
    if (this.finished) {
      return BlockContinue.none();
    }

    // Blank line ends type 6 and type 7 blocks
    if (state.isBlank() && this.closingPattern === null) {
      return BlockContinue.none();
    } else {
      return BlockContinue.atIndex(state.getIndex());
    }
  }

  public addLine(line: SourceLine) {
    this.content!.add(line.getContent());

    if (
      this.closingPattern !== null &&
      this.closingPattern.exec(line.getContent())
    ) {
      this.finished = true;
    }
  }

  public closeBlock() {
    this.block.setLiteral(this.content!.getString());
    this.content = null;
  }

  public static Factory = Factory;
}

export default HtmlBlockParser;
