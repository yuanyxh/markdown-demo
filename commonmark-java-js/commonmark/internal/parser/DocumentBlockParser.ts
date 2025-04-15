import type { SourceLine, ParserState } from '@/parser';
import type { Block } from '@/node';

import { Document } from '@/node';
import { AbstractBlockParser, BlockContinue } from '@/parser';

class DocumentBlockParser extends AbstractBlockParser {
  private readonly document = new Document();

  override isContainer(): boolean {
    return true;
  }

  override canContain(block: Block): boolean {
    return true;
  }

  override getBlock(): Document {
    return this.document;
  }

  override tryContinue(state: ParserState): BlockContinue {
    return BlockContinue.atIndex(state.getIndex());
  }

  override addLine(line: SourceLine) {}
}

export default DocumentBlockParser;
