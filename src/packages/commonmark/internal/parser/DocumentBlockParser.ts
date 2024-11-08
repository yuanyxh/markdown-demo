import type { SourceLine, ParserState } from "../../parser";
import type { Block } from "../../node";

import { Document } from "../../node";
import { AbstractBlockParser, BlockContinue } from "../../parser";

class DocumentBlockParser extends AbstractBlockParser {
  private readonly document = new Document();

  public override isContainer(): boolean {
    return true;
  }

  public override canContain(block: Block): boolean {
    return true;
  }

  public override getBlock(): Document {
    return this.document;
  }

  public override tryContinue(state: ParserState): BlockContinue {
    return BlockContinue.atIndex(state.getIndex());
  }

  public override addLine(line: SourceLine) {}
}

export default DocumentBlockParser;
