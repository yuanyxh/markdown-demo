


import { java, type char, type int } from "jree";



export  class FencedCodeBlockParser extends AbstractBlockParser {

    private readonly  block:  FencedCodeBlock | null = new  FencedCodeBlock();
    private readonly  fenceChar:  char;
    private readonly  openingFenceLength:  int;

    private  firstLine:  java.lang.String | null;
    private  otherLines:  java.lang.StringBuilder | null = new  java.lang.StringBuilder();

    public  constructor(fenceChar: char, fenceLength: int, fenceIndent: int) {
        super();
this.fenceChar = fenceChar;
        this.openingFenceLength = fenceLength;
        this.block.setFenceCharacter(java.lang.String.valueOf(fenceChar));
        this.block.setOpeningFenceLength(fenceLength);
        this.block.setFenceIndent(fenceIndent);
    }

    public  getBlock():  Block | null {
        return this.block;
    }

    public  tryContinue(state: ParserState| null):  BlockContinue | null {
        let  nextNonSpace: int = state.getNextNonSpaceIndex();
        let  newIndex: int = state.getIndex();
        let  line: java.lang.CharSequence = state.getLine().getContent();
        if (state.getIndent() < Parsing.CODE_BLOCK_INDENT && nextNonSpace < line.length() && this.tryClosing(line, nextNonSpace)) {
            // closing fence - we're at end of line, so we can finalize now
            return BlockContinue.finished();
        } else {
            // skip optional spaces of fence indent
            let  i: int = this.block.getFenceIndent();
            let  length: int = line.length();
            while (i > 0 && newIndex < length && line.charAt(newIndex) === ' ') {
                newIndex++;
                i--;
            }
        }
        return BlockContinue.atIndex(newIndex);
    }

    public  addLine(line: SourceLine| null):  void {
        if (this.firstLine === null) {
            this.firstLine = line.getContent().toString();
        } else {
            this.otherLines.append(line.getContent());
            this.otherLines.append('\n');
        }
    }

    public  closeBlock():  void {
        // first line becomes info string
        this.block.setInfo(unescapeString(this.firstLine.trim()));
        this.block.setLiteral(this.otherLines.toString());
    }

    public static Factory =  class Factory extends AbstractBlockParserFactory {

        public  tryStart(state: ParserState| null, matchedBlockParser: MatchedBlockParser| null):  BlockStart | null {
            let  indent: int = state.getIndent();
            if (indent >= Parsing.CODE_BLOCK_INDENT) {
                return BlockStart.none();
            }

            let  nextNonSpace: int = state.getNextNonSpaceIndex();
            let  blockParser: FencedCodeBlockParser = FencedCodeBlockParser.checkOpener(state.getLine().getContent(), nextNonSpace, indent);
            if (blockParser !== null) {
                return BlockStart.of(blockParser).atIndex(nextNonSpace + blockParser.block.getOpeningFenceLength());
            } else {
                return BlockStart.none();
            }
        }
    };


    // spec: A code fence is a sequence of at least three consecutive backtick characters (`) or tildes (~). (Tildes and
    // backticks cannot be mixed.)
    private static  checkOpener(line: java.lang.CharSequence| null, index: int, indent: int):  FencedCodeBlockParser | null {
        let  backticks: int = 0;
        let  tildes: int = 0;
        let  length: int = line.length();
        loop:
        for (let  i: int = index; i < length; i++) {
            switch (line.charAt(i)) {
                case '`':
                    backticks++;
                    break;
                case '~':
                    tildes++;
                    break;
                default:
                    break loop;
            }
        }
        if (backticks >= 3 && tildes === 0) {
            // spec: If the info string comes after a backtick fence, it may not contain any backtick characters.
            if (Characters.find('`', line, index + backticks) !== -1) {
                return null;
            }
            return new  FencedCodeBlockParser('`', backticks, indent);
        } else if (tildes >= 3 && backticks === 0) {
            // spec: Info strings for tilde code blocks can contain backticks and tildes
            return new  FencedCodeBlockParser('~', tildes, indent);
        } else {
            return null;
        }
    }

    // spec: The content of the code block consists of all subsequent lines, until a closing code fence of the same type
    // as the code block began with (backticks or tildes), and with at least as many backticks or tildes as the opening
    // code fence.
    private  tryClosing(line: java.lang.CharSequence| null, index: int):  boolean {
        let  fences: int = Characters.skip(this.fenceChar, line, index, line.length()) - index;
        if (fences < this.openingFenceLength) {
            return false;
        }
        // spec: The closing code fence [...] may be followed only by spaces, which are ignored.
        let  after: int = Characters.skipSpaceTab(line, index + fences, line.length());
        if (after === line.length()) {
            this.block.setClosingFenceLength(fences);
            return true;
        }
        return false;
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace FencedCodeBlockParser {
	export type Factory = InstanceType<typeof FencedCodeBlockParser.Factory>;
}


