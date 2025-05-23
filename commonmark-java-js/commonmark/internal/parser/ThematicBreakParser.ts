import type { Block } from '@/node';
import type { BlockParserFactory, MatchedBlockParser, ParserState } from '@/parser';

import { ThematicBreak } from '@/node';
import { AbstractBlockParser, BlockStart, BlockContinue } from '@/parser';

class Factory implements BlockParserFactory {
  tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null {
    if (state.getIndent() >= 4) {
      return BlockStart.none();
    }

    const nextNonSpace = state.getNextNonSpaceIndex();
    const line = state.getLine().getContent();

    if (ThematicBreakParser.isThematicBreak(line, nextNonSpace)) {
      const literal = line.substring(state.getIndex(), line.length);

      return BlockStart.of(new ThematicBreakParser(literal)).atIndex(line.length);
    } else {
      return BlockStart.none();
    }
  }
}

class ThematicBreakParser extends AbstractBlockParser {
  private readonly block = new ThematicBreak();

  constructor(literal: string) {
    super();
    this.block.setLiteral(literal);
  }

  override getBlock(): Block {
    return this.block;
  }

  override tryContinue(state: ParserState): BlockContinue | null {
    // a horizontal rule can never container > 1 line, so fail to match
    return BlockContinue.none();
  }

  static Factory = Factory;

  // spec: A line consisting of 0-3 spaces of indentation, followed by a sequence of three or more matching -, _, or *
  // characters, each followed optionally by any number of spaces, forms a thematic break.
  static isThematicBreak(line: string, index: number): boolean {
    let dashes = 0;
    let underscores = 0;
    let asterisks = 0;
    const length = line.length;
    for (let i = index; i < length; i++) {
      switch (line.charAt(i)) {
        case '-':
          dashes++;
          break;
        case '_':
          underscores++;
          break;
        case '*':
          asterisks++;
          break;
        case ' ':
        case '\t':
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

export default ThematicBreakParser;
