import type { Block } from "../../node";
import type { BlockParserFactory, ParserState, SourceLine } from "../../parser";

import Parsing from "../internal_util/Parsing";
import { Appendable } from "../../../common";
import { IndentedCodeBlock, Paragraph } from "../../node";
import {
  AbstractBlockParser,
  BlockStart,
  MatchedBlockParser,
  BlockContinue,
} from "../../parser";
import { Characters } from "../../text";

class Factory implements BlockParserFactory {
  public tryStart(
    state: ParserState,
    matchedBlockParser: MatchedBlockParser
  ): BlockStart | null {
    // An indented code block cannot interrupt a paragraph.
    if (
      state.getIndent() >= Parsing.CODE_BLOCK_INDENT &&
      !state.isBlank() &&
      !(state.getActiveBlockParser().getBlock() instanceof Paragraph)
    ) {
      return BlockStart.of(new IndentedCodeBlockParser()).atColumn(
        state.getColumn() + Parsing.CODE_BLOCK_INDENT
      );
    } else {
      return BlockStart.none();
    }
  }
}

class IndentedCodeBlockParser extends AbstractBlockParser {
  private readonly block = new IndentedCodeBlock();
  private readonly lines: string[] = [];

  public override getBlock(): Block {
    return this.block;
  }

  public override tryContinue(state: ParserState): BlockContinue | null {
    if (state.getIndent() >= Parsing.CODE_BLOCK_INDENT) {
      return BlockContinue.atColumn(
        state.getColumn() + Parsing.CODE_BLOCK_INDENT
      );
    } else if (state.isBlank()) {
      return BlockContinue.atIndex(state.getNextNonSpaceIndex());
    } else {
      return BlockContinue.none();
    }
  }

  public override addLine(line: SourceLine) {
    this.lines.push(line.getContent());
  }

  public override closeBlock() {
    let lastNonBlank = this.lines.length - 1;

    while (lastNonBlank >= 0) {
      if (!Characters.isBlank(this.lines[lastNonBlank])) {
        break;
      }

      lastNonBlank--;
    }

    const sb = new Appendable();
    for (let i = 0; i < lastNonBlank + 1; i++) {
      sb.append(this.lines[i]);
      sb.append("\n");
    }

    this.block.setLiteral(sb.toString());
  }

  public static Factory = Factory;
}

export default IndentedCodeBlockParser;
