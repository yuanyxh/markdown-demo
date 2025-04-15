import type { Block, DefinitionMap, SourceSpan } from '@/node';
import type { BlockContinue } from '@/parser';

import type SourceLine from '../parser_utils/SourceLine';
import type { BlockParser } from '../interfaces/BlockParser';
import type { InlineParser } from '../interfaces/InlineParser';
import type { ParserState } from '../interfaces/ParserState';

abstract class AbstractBlockParser implements BlockParser {
  getBlock(): Block {
    throw new Error('Method not implemented.');
  }

  tryContinue(parserState: ParserState): BlockContinue | null {
    return null;
  }

  isContainer(): boolean {
    return false;
  }

  canHaveLazyContinuationLines(): boolean {
    return false;
  }

  canContain(childBlock: Block): boolean {
    return false;
  }

  addLine(line: SourceLine) {}

  addSourceSpan(sourceSpan: SourceSpan) {
    this.getBlock().addSourceSpan(sourceSpan);
  }

  getDefinitions(): DefinitionMap<any>[] {
    return [];
  }

  closeBlock() {}

  parseInlines(inlineParser: InlineParser) {}
}

export default AbstractBlockParser;
