


import { java, type int } from "jree";



export  class BlockQuoteParser extends AbstractBlockParser {

    private readonly  block:  BlockQuote | null = new  BlockQuote();

    public  isContainer():  boolean {
        return true;
    }

    public  canContain(block: Block| null):  boolean {
        return true;
    }

    public  getBlock():  BlockQuote | null {
        return this.block;
    }

    public  tryContinue(state: ParserState| null):  BlockContinue | null {
        let  nextNonSpace: int = state.getNextNonSpaceIndex();
        if (BlockQuoteParser.isMarker(state, nextNonSpace)) {
            let  newColumn: int = state.getColumn() + state.getIndent() + 1;
            // optional following space or tab
            if (Characters.isSpaceOrTab(state.getLine().getContent(), nextNonSpace + 1)) {
                newColumn++;
            }
            return BlockContinue.atColumn(newColumn);
        } else {
            return BlockContinue.none();
        }
    }

    private static  isMarker(state: ParserState| null, index: int):  boolean {
        let  line: java.lang.CharSequence = state.getLine().getContent();
        return state.getIndent() < Parsing.CODE_BLOCK_INDENT && index < line.length() && line.charAt(index) === '>';
    }

    public static Factory =  class Factory extends AbstractBlockParserFactory {
        public  tryStart(state: ParserState| null, matchedBlockParser: MatchedBlockParser| null):  BlockStart | null {
            let  nextNonSpace: int = state.getNextNonSpaceIndex();
            if (BlockQuoteParser.isMarker(state, nextNonSpace)) {
                let  newColumn: int = state.getColumn() + state.getIndent() + 1;
                // optional following space or tab
                if (Characters.isSpaceOrTab(state.getLine().getContent(), nextNonSpace + 1)) {
                    newColumn++;
                }
                return BlockStart.of(new  BlockQuoteParser()).atColumn(newColumn);
            } else {
                return BlockStart.none();
            }
        }
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace BlockQuoteParser {
	export type Factory = InstanceType<typeof BlockQuoteParser.Factory>;
}


