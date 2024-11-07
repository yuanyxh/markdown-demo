import Appendable from "../../common/Appendable";
import { Block, IndentedCodeBlock, Paragraph } from "../node";
import {
  AbstractBlockParser,
  AbstractBlockParserFactory,
  BlockContinue,
  BlockStart,
  MatchedBlockParser,
  ParserState,
  SourceLine,
} from "../parser";
import { Characters } from "../text";
import Parsing from "./util/Parsing";

class Factory extends AbstractBlockParserFactory {
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

  public getBlock(): Block {
    return this.block;
  }

  public tryContinue(state: ParserState): BlockContinue | null {
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

  public addLine(line: SourceLine): void {
    this.lines.push(line.getContent());
  }

  public closeBlock(): void {
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

    let literal: string = sb.toString();
    this.block.setLiteral(literal);
  }

  public static Factory = Factory;
}

export default IndentedCodeBlockParser;
