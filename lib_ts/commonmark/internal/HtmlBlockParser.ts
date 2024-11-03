


import { java, type int } from "jree";



export  class HtmlBlockParser extends AbstractBlockParser {

    private static readonly  TAGNAME:  java.lang.String | null = "[A-Za-z][A-Za-z0-9-]*";
    private static readonly  ATTRIBUTENAME:  java.lang.String | null = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
    private static readonly  UNQUOTEDVALUE:  java.lang.String | null = "[^\"'=<>`\\x00-\\x20]+";
    private static readonly  SINGLEQUOTEDVALUE:  java.lang.String | null = "'[^']*'";
    private static readonly  DOUBLEQUOTEDVALUE:  java.lang.String | null = "\"[^\"]*\"";
    private static readonly  ATTRIBUTEVALUE:  java.lang.String | null = "(?:" + HtmlBlockParser.UNQUOTEDVALUE + "|" + HtmlBlockParser.SINGLEQUOTEDVALUE
            + "|" + HtmlBlockParser.DOUBLEQUOTEDVALUE + ")";
    private static readonly  ATTRIBUTEVALUESPEC:  java.lang.String | null = "(?:" + "\\s*=" + "\\s*" + HtmlBlockParser.ATTRIBUTEVALUE
            + ")";
    private static readonly  ATTRIBUTE:  java.lang.String | null = "(?:" + "\\s+" + HtmlBlockParser.ATTRIBUTENAME + HtmlBlockParser.ATTRIBUTEVALUESPEC
            + "?)";

    private static readonly  OPENTAG:  java.lang.String | null = "<" + HtmlBlockParser.TAGNAME + HtmlBlockParser.ATTRIBUTE + "*" + "\\s*/?>";
    private static readonly  CLOSETAG:  java.lang.String | null = "</" + HtmlBlockParser.TAGNAME + "\\s*[>]";

    private static readonly  BLOCK_PATTERNS:  java.util.regex.Pattern[][] | null =  [
            [null, null], // not used (no type 0)
            [
                    java.util.regex.Pattern.compile("^<(?:script|pre|style|textarea)(?:\\s|>|$)", java.util.regex.Pattern.CASE_INSENSITIVE),
                    java.util.regex.Pattern.compile("</(?:script|pre|style|textarea)>", java.util.regex.Pattern.CASE_INSENSITIVE)
            ],
            [
                    java.util.regex.Pattern.compile("^<!--"),
                    java.util.regex.Pattern.compile("-->")
            ],
            [
                    java.util.regex.Pattern.compile("^<[?]"),
                    java.util.regex.Pattern.compile("\\?>")
            ],
            [
                    java.util.regex.Pattern.compile("^<![A-Z]"),
                    java.util.regex.Pattern.compile(">")
            ],
            [
                    java.util.regex.Pattern.compile("^<!\\[CDATA\\["),
                    java.util.regex.Pattern.compile("\\]\\]>")
            ],
            [
                    java.util.regex.Pattern.compile("^</?(?:" +
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
                            ")(?:\\s|[/]?[>]|$)", java.util.regex.Pattern.CASE_INSENSITIVE),
                    null // terminated by blank line
            ],
            [
                    java.util.regex.Pattern.compile("^(?:" + HtmlBlockParser.OPENTAG + '|' + HtmlBlockParser.CLOSETAG + ")\\s*$", java.util.regex.Pattern.CASE_INSENSITIVE),
                    null // terminated by blank line
            ]
    ];

    private readonly  block:  HtmlBlock | null = new  HtmlBlock();
    private readonly  closingPattern:  java.util.regex.Pattern | null;

    private  finished:  boolean = false;
    private  content:  BlockContent | null = new  BlockContent();

    private  constructor(closingPattern: java.util.regex.Pattern| null) {
        super();
this.closingPattern = closingPattern;
    }

    public  getBlock():  Block | null {
        return this.block;
    }

    public  tryContinue(state: ParserState| null):  BlockContinue | null {
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

    public  addLine(line: SourceLine| null):  void {
        this.content.add(line.getContent());

        if (this.closingPattern !== null && this.closingPattern.matcher(line.getContent()).find()) {
            this.finished = true;
        }
    }

    public  closeBlock():  void {
        this.block.setLiteral(this.content.getString());
        this.content = null;
    }

    public static Factory =  class Factory extends AbstractBlockParserFactory {

        public  tryStart(state: ParserState| null, matchedBlockParser: MatchedBlockParser| null):  BlockStart | null {
            let  nextNonSpace: int = state.getNextNonSpaceIndex();
            let  line: java.lang.CharSequence = state.getLine().getContent();

            if (state.getIndent() < 4 && line.charAt(nextNonSpace) === '<') {
                for (let  blockType: int = 1; blockType <= 7; blockType++) {
                    // Type 7 can not interrupt a paragraph (not even a lazy one)
                    if (blockType === 7 && (
                            matchedBlockParser.getMatchedBlockParser().getBlock() instanceof Paragraph ||
                                    state.getActiveBlockParser().canHaveLazyContinuationLines())) {
                        continue;
                    }
                    let  opener: java.util.regex.Pattern = HtmlBlockParser.BLOCK_PATTERNS[blockType][0];
                    let  closer: java.util.regex.Pattern = HtmlBlockParser.BLOCK_PATTERNS[blockType][1];
                    let  matches: boolean = opener.matcher(line.subSequence(nextNonSpace, line.length())).find();
                    if (matches) {
                        return BlockStart.of(new  HtmlBlockParser(closer)).atIndex(state.getIndex());
                    }
                }
            }
            return BlockStart.none();
        }
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace HtmlBlockParser {
	export type Factory = InstanceType<typeof HtmlBlockParser.Factory>;
}


