


import { java, type int, type char } from "jree";



export  class HeadingParser extends AbstractBlockParser {

    private readonly  block:  Heading | null = new  Heading();
    private readonly  content:  SourceLines | null;

    public  constructor(level: int, content: SourceLines| null) {
        super();
this.block.setLevel(level);
        this.content = content;
    }

    public  getBlock():  Block | null {
        return this.block;
    }

    public  tryContinue(parserState: ParserState| null):  BlockContinue | null {
        // In both ATX and Setext headings, once we have the heading markup, there's nothing more to parse.
        return BlockContinue.none();
    }

    public  parseInlines(inlineParser: InlineParser| null):  void {
        inlineParser.parse(this.content, this.block);
    }

    public static Factory =  class Factory extends AbstractBlockParserFactory {

        public  tryStart(state: ParserState| null, matchedBlockParser: MatchedBlockParser| null):  BlockStart | null {
            if (state.getIndent() >= Parsing.CODE_BLOCK_INDENT) {
                return BlockStart.none();
            }

            let  line: SourceLine = state.getLine();
            let  nextNonSpace: int = state.getNextNonSpaceIndex();
            if (line.getContent().charAt(nextNonSpace) === '#') {
                let  atxHeading: HeadingParser = HeadingParser.getAtxHeading(line.substring(nextNonSpace, line.getContent().length()));
                if (atxHeading !== null) {
                    return BlockStart.of(atxHeading).atIndex(line.getContent().length());
                }
            }

            let  setextHeadingLevel: int = HeadingParser.getSetextHeadingLevel(line.getContent(), nextNonSpace);
            if (setextHeadingLevel > 0) {
                let  paragraph: SourceLines = matchedBlockParser.getParagraphLines();
                if (!paragraph.isEmpty()) {
                    return BlockStart.of(new  HeadingParser(setextHeadingLevel, paragraph))
                            .atIndex(line.getContent().length())
                            .replaceActiveBlockParser();
                }
            }

            return BlockStart.none();
        }
    };


    // spec: An ATX heading consists of a string of characters, parsed as inline content, between an opening sequence of
    // 1-6 unescaped # characters and an optional closing sequence of any number of unescaped # characters. The opening
    // sequence of # characters must be followed by a space or by the end of line. The optional closing sequence of #s
    // must be preceded by a space and may be followed by spaces only.
    private static  getAtxHeading(line: SourceLine| null):  HeadingParser | null {
        let  scanner: java.util.Scanner = java.util.Scanner.of(SourceLines.of(line));
        let  level: int = scanner.matchMultiple('#');

        if (level === 0 || level > 6) {
            return null;
        }

        if (!scanner.hasNext()) {
            // End of line after markers is an empty heading
            return new  HeadingParser(level, SourceLines.empty());
        }

        let  next: char = scanner.peek();
        if (!(next === ' ' || next === '\t')) {
            return null;
        }

        scanner.whitespace();
        let  start: Position = scanner.position();
        let  end: Position = start;
        let  hashCanEnd: boolean = true;

        while (scanner.hasNext()) {
            let  c: char = scanner.peek();
            switch (c) {
                case '#':
                    if (hashCanEnd) {
                        scanner.matchMultiple('#');
                        let  whitespace: int = scanner.whitespace();
                        // If there's other characters, the hashes and spaces were part of the heading
                        if (scanner.hasNext()) {
                            end = scanner.position();
                        }
                        hashCanEnd = whitespace > 0;
                    } else {
                        scanner.next();
                        end = scanner.position();
                    }
                    break;
                case ' ':
                case '\t':
                    hashCanEnd = true;
                    scanner.next();
                    break;
                default:
                    hashCanEnd = false;
                    scanner.next();
                    end = scanner.position();
            }
        }

        let  source: SourceLines = scanner.getSource(start, end);
        let  content: java.lang.String = source.getContent();
        if (content.isEmpty()) {
            return new  HeadingParser(level, SourceLines.empty());
        }
        return new  HeadingParser(level, source);
    }

    // spec: A setext heading underline is a sequence of = characters or a sequence of - characters, with no more than
    // 3 spaces indentation and any number of trailing spaces.
    private static  getSetextHeadingLevel(line: java.lang.CharSequence| null, index: int):  int {
        switch (line.charAt(index)) {
            case '=':
                if (HeadingParser.isSetextHeadingRest(line, index + 1, '=')) {
                    return 1;
                }
                break;
            case '-':
                if (HeadingParser.isSetextHeadingRest(line, index + 1, '-')) {
                    return 2;
                }
                break;

default:

        }
        return 0;
    }

    private static  isSetextHeadingRest(line: java.lang.CharSequence| null, index: int, marker: char):  boolean {
        let  afterMarker: int = Characters.skip(marker, line, index, line.length());
        let  afterSpace: int = Characters.skipSpaceTab(line, afterMarker, line.length());
        return afterSpace >= line.length();
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace HeadingParser {
	export type Factory = InstanceType<typeof HeadingParser.Factory>;
}


