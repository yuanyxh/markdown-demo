import type { Block } from "../../node";
import type {
  BlockParserFactory,
  MatchedBlockParser,
  ParserState,
} from "../../parser";

import { BlockQuote } from "../../node";
import Parsing from "../internal_util/Parsing";
import { Characters } from "../../text";
import { AbstractBlockParser, BlockStart, BlockContinue } from "../../parser";

class Factory implements BlockParserFactory {
  public tryStart(
    state: ParserState,
    matchedBlockParser: MatchedBlockParser
  ): BlockStart | null {
    const nextNonSpace = state.getNextNonSpaceIndex();
    if (BlockQuoteParser.isMarker(state, nextNonSpace)) {
      let newColumn = state.getColumn() + state.getIndent() + 1;

      // optional following space or tab
      if (
        Characters.isSpaceOrTab(state.getLine().getContent(), nextNonSpace + 1)
      ) {
        newColumn++;
      }

      return BlockStart.of(new BlockQuoteParser()).atColumn(newColumn);
    } else {
      return BlockStart.none();
    }
  }
}

class BlockQuoteParser extends AbstractBlockParser {
  private readonly block = new BlockQuote();

  public override isContainer(): boolean {
    return true;
  }

  public override canContain(block: Block): boolean {
    return true;
  }

  public override getBlock(): BlockQuote {
    return this.block;
  }

  public override tryContinue(state: ParserState): BlockContinue | null {
    const nextNonSpace = state.getNextNonSpaceIndex();

    if (BlockQuoteParser.isMarker(state, nextNonSpace)) {
      let newColumn = state.getColumn() + state.getIndent() + 1;

      // optional following space or tab
      if (
        Characters.isSpaceOrTab(state.getLine().getContent(), nextNonSpace + 1)
      ) {
        newColumn++;
      }

      return BlockContinue.atColumn(newColumn);
    } else {
      return BlockContinue.none();
    }
  }

  public static isMarker(state: ParserState, index: number): boolean {
    const line = state.getLine().getContent();

    return (
      state.getIndent() < Parsing.CODE_BLOCK_INDENT &&
      index < line.length &&
      line.charAt(index) === ">"
    );
  }

  public static Factory = Factory;
}

export default BlockQuoteParser;
