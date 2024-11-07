import Appendable from "../../common/Appendable";
import { Block, FencedCodeBlock } from "../node";
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
import Escaping from "./util/Escaping";
import Parsing from "./util/Parsing";

class Factory extends AbstractBlockParserFactory {
  public tryStart(
    state: ParserState,
    matchedBlockParser: MatchedBlockParser
  ): BlockStart | null {
    const indent = state.getIndent();
    if (indent >= Parsing.CODE_BLOCK_INDENT) {
      return BlockStart.none();
    }

    let nextNonSpace = state.getNextNonSpaceIndex();
    const blockParser = FencedCodeBlockParser.checkOpener(
      state.getLine().getContent(),
      nextNonSpace,
      indent
    );

    if (blockParser !== null) {
      return BlockStart.of(blockParser).atIndex(
        nextNonSpace + blockParser.block.getOpeningFenceLength()
      );
    } else {
      return BlockStart.none();
    }
  }
}

class FencedCodeBlockParser extends AbstractBlockParser {
  public readonly block = new FencedCodeBlock();
  private readonly fenceChar: string;
  private readonly openingFenceLength: number;

  private firstLine: string | null = null;
  private otherLines = new Appendable();

  public constructor(
    fenceChar: string,
    fenceLength: number,
    fenceIndent: number
  ) {
    super();
    this.fenceChar = fenceChar;
    this.openingFenceLength = fenceLength;
    this.block.setFenceCharacter(fenceChar);
    this.block.setOpeningFenceLength(fenceLength);
    this.block.setFenceIndent(fenceIndent);
  }

  public getBlock(): Block {
    return this.block;
  }

  public tryContinue(state: ParserState): BlockContinue {
    const nextNonSpace = state.getNextNonSpaceIndex();
    let newIndex = state.getIndex();
    const line = state.getLine().getContent();
    if (
      state.getIndent() < Parsing.CODE_BLOCK_INDENT &&
      nextNonSpace < line.length &&
      this.tryClosing(line, nextNonSpace)
    ) {
      // closing fence - we're at end of line, so we can finalize now
      return BlockContinue.finished();
    } else {
      // skip optional spaces of fence indent
      let i = this.block.getFenceIndent();
      const length = line.length;

      while (i > 0 && newIndex < length && line.charAt(newIndex) === " ") {
        newIndex++;
        i--;
      }
    }
    return BlockContinue.atIndex(newIndex);
  }

  public addLine(line: SourceLine) {
    if (this.firstLine === null) {
      this.firstLine = line.getContent().toString();
    } else {
      this.otherLines.append(line.getContent());
      this.otherLines.append("\n");
    }
  }

  public closeBlock() {
    // first line becomes info string
    this.block.setInfo(Escaping.unescapeString(this.firstLine!.trim()));
    this.block.setLiteral(this.otherLines.toString());
  }

  public static Factory = Factory;

  // spec: A code fence is a sequence of at least three consecutive backtick characters (`) or tildes (~). (Tildes and
  // backticks cannot be mixed.)
  public static checkOpener(
    line: string,
    index: number,
    indent: number
  ): FencedCodeBlockParser | null {
    let backticks = 0;
    let tildes = 0;
    const length = line.length;

    loop: for (let i = index; i < length; i++) {
      switch (line.charAt(i)) {
        case "`":
          backticks++;
          break;
        case "~":
          tildes++;
          break;
        default:
          break loop;
      }
    }

    if (backticks >= 3 && tildes === 0) {
      // spec: If the info string comes after a backtick fence, it may not contain any backtick characters.
      if (Characters.find("`", line, index + backticks) !== -1) {
        return null;
      }

      return new FencedCodeBlockParser("`", backticks, indent);
    } else if (tildes >= 3 && backticks === 0) {
      // spec: Info strings for tilde code blocks can contain backticks and tildes
      return new FencedCodeBlockParser("~", tildes, indent);
    } else {
      return null;
    }
  }

  // spec: The content of the code block consists of all subsequent lines, until a closing code fence of the same type
  // as the code block began with (backticks or tildes), and with at least as many backticks or tildes as the opening
  // code fence.
  private tryClosing(line: string, index: number): boolean {
    let fences =
      Characters.skip(this.fenceChar, line, index, line.length) - index;

    if (fences < this.openingFenceLength) {
      return false;
    }

    // spec: The closing code fence [...] may be followed only by spaces, which are ignored.
    let after = Characters.skipSpaceTab(line, index + fences, line.length);

    if (after === line.length) {
      this.block.setClosingFenceLength(fences);
      return true;
    }

    return false;
  }
}

export default FencedCodeBlockParser;
