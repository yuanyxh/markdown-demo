import type { Block } from '@/node';
import type {
  BlockParserFactory,
  InlineParser,
  MatchedBlockParser,
  ParserState,
  SourceLine
} from '@/parser';

import { Heading } from '@/node';
import { AbstractBlockParser, BlockStart, Scanner, SourceLines, BlockContinue } from '@/parser';
import { Characters } from '@/text';

import Parsing from '../internal_util/Parsing';

class Factory implements BlockParserFactory {
  tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null {
    if (state.getIndent() >= Parsing.CODE_BLOCK_INDENT) {
      return BlockStart.none();
    }

    const line = state.getLine();
    let nextNonSpace = state.getNextNonSpaceIndex();
    if (line.getContent().charAt(nextNonSpace) === '#') {
      let atxHeading = HeadingParser.getAtxHeading(
        line.substring(nextNonSpace, line.getContent().length)
      );

      if (atxHeading !== null) {
        return BlockStart.of(atxHeading).atIndex(line.getContent().length);
      }
    }

    const setextHeadingLevel = HeadingParser.getSetextHeadingLevel(line.getContent(), nextNonSpace);

    if (setextHeadingLevel > 0) {
      const paragraph = matchedBlockParser.getParagraphLines();

      if (!paragraph.isEmpty()) {
        return BlockStart.of(new HeadingParser(setextHeadingLevel, paragraph))
          .atIndex(line.getContent().length)
          .setReplaceActiveBlockParser();
      }
    }

    return BlockStart.none();
  }
}

class HeadingParser extends AbstractBlockParser {
  private readonly block = new Heading();
  private readonly content: SourceLines;

  constructor(level: number, content: SourceLines) {
    super();

    this.block.setLevel(level);
    this.content = content;
  }

  override getBlock(): Block {
    return this.block;
  }

  override tryContinue(parserState: ParserState): BlockContinue | null {
    // In both ATX and Setext headings, once we have the heading markup, there's nothing more to parse.
    return BlockContinue.none();
  }

  parseInlines(inlineParser: InlineParser) {
    inlineParser.parse(this.content, this.block);
  }

  // spec: An ATX heading consists of a string of characters, parsed as inline content, between an opening sequence of
  // 1-6 unescaped # characters and an optional closing sequence of any number of unescaped # characters. The opening
  // sequence of # characters must be followed by a space or by the end of line. The optional closing sequence of #s
  // must be preceded by a space and may be followed by spaces only.
  static getAtxHeading(line: SourceLine): HeadingParser | null {
    const scanner = Scanner.of(SourceLines.of([line]));
    const level = scanner.matchMultiple('#');

    if (level === 0 || level > 6) {
      return null;
    }

    if (!scanner.hasNext()) {
      // End of line after markers is an empty heading
      return new HeadingParser(level, SourceLines.empty());
    }

    const next = scanner.peek();
    if (!(next === ' ' || next === '\t')) {
      return null;
    }

    scanner.whitespace();
    const start = scanner.position();
    let end = start;
    let hashCanEnd = true;

    while (scanner.hasNext()) {
      let c = scanner.peek();

      switch (c) {
        case '#':
          if (hashCanEnd) {
            scanner.matchMultiple('#');
            const whitespace = scanner.whitespace();

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

    const source = scanner.getSource(start, end);
    const content: string = source.getContent();

    if (content === '') {
      return new HeadingParser(level, SourceLines.empty());
    }

    return new HeadingParser(level, source);
  }

  // spec: A setext heading underline is a sequence of = characters or a sequence of - characters, with no more than
  // 3 spaces indentation and any number of trailing spaces.
  static getSetextHeadingLevel(line: string, index: number): number {
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

  private static isSetextHeadingRest(line: string, index: number, marker: string): boolean {
    const afterMarker = Characters.skip(marker, line, index, line.length);
    const afterSpace = Characters.skipSpaceTab(line, afterMarker, line.length);

    return afterSpace >= line.length;
  }

  static Factory = Factory;
}

export default HeadingParser;
