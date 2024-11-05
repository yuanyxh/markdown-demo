export class ThematicBreakParser extends AbstractBlockParser {
  private readonly block: ThematicBreak | null = new ThematicBreak();

  public constructor(literal: string | null) {
    super();
    this.block.setLiteral(literal);
  }

  public getBlock(): Block | null {
    return this.block;
  }

  public tryContinue(state: ParserState | null): BlockContinue | null {
    // a horizontal rule can never container > 1 line, so fail to match
    return BlockContinue.none();
  }

  public static Factory = class Factory extends AbstractBlockParserFactory {
    public tryStart(
      state: ParserState | null,
      matchedBlockParser: MatchedBlockParser | null
    ): BlockStart | null {
      if (state.getIndent() >= 4) {
        return BlockStart.none();
      }
      let nextNonSpace: int = state.getNextNonSpaceIndex();
      let line: java.lang.CharSequence = state.getLine().getContent();
      if (ThematicBreakParser.isThematicBreak(line, nextNonSpace)) {
        let literal = string.valueOf(
          line.subSequence(state.getIndex(), line.length())
        );
        return BlockStart.of(new ThematicBreakParser(literal)).atIndex(
          line.length()
        );
      } else {
        return BlockStart.none();
      }
    }
  };

  // spec: A line consisting of 0-3 spaces of indentation, followed by a sequence of three or more matching -, _, or *
  // characters, each followed optionally by any number of spaces, forms a thematic break.
  private static isThematicBreak(
    line: java.lang.CharSequence | null,
    index: int
  ): boolean {
    let dashes: int = 0;
    let underscores: int = 0;
    let asterisks: int = 0;
    let length: int = line.length();
    for (let i: int = index; i < length; i++) {
      switch (line.charAt(i)) {
        case "-":
          dashes++;
          break;
        case "_":
          underscores++;
          break;
        case "*":
          asterisks++;
          break;
        case " ":
        case "\t":
          // Allowed, even between markers
          break;
        default:
          return false;
      }
    }

    return (
      (dashes >= 3 && underscores === 0 && asterisks === 0) ||
      (underscores >= 3 && dashes === 0 && asterisks === 0) ||
      (asterisks >= 3 && dashes === 0 && underscores === 0)
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace ThematicBreakParser {
  export type Factory = InstanceType<typeof ThematicBreakParser.Factory>;
}
