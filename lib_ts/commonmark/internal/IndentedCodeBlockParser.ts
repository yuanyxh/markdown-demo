class IndentedCodeBlockParser extends AbstractBlockParser {
  private readonly block: IndentedCodeBlock | null = new IndentedCodeBlock();
  private readonly lines: java.util.List<java.lang.CharSequence> | null =
    new java.util.ArrayList();

  public getBlock(): Block | null {
    return this.block;
  }

  public tryContinue(state: ParserState | null): BlockContinue | null {
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

  public addLine(line: SourceLine | null): void {
    this.lines.add(line.getContent());
  }

  public closeBlock(): void {
    let lastNonBlank: int = this.lines.size() - 1;
    while (lastNonBlank >= 0) {
      if (!Characters.isBlank(this.lines.get(lastNonBlank))) {
        break;
      }
      lastNonBlank--;
    }

    let sb: stringBuilder = new stringBuilder();
    for (let i: int = 0; i < lastNonBlank + 1; i++) {
      sb.append(this.lines.get(i));
      sb.append("\n");
    }

    let literal: string = sb.toString();
    this.block.setLiteral(literal);
  }

  public static Factory = class Factory extends AbstractBlockParserFactory {
    public tryStart(
      state: ParserState | null,
      matchedBlockParser: MatchedBlockParser | null
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
  };
}

export default IndentedCodeBlockParser;
