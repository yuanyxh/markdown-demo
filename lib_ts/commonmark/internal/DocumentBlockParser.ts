import { Block, Document } from "../node";
import {
  AbstractBlockParser,
  BlockContinue,
  ParserState,
  SourceLine,
} from "../parser";

class DocumentBlockParser extends AbstractBlockParser {
  private readonly document = new Document();

  public isContainer(): boolean {
    return true;
  }

  public canContain(block: Block): boolean {
    return true;
  }

  public getBlock(): Document {
    return this.document;
  }

  public tryContinue(state: ParserState): BlockContinue {
    return BlockContinue.atIndex(state.getIndex());
  }

  public addLine(line: SourceLine) {}
}

export default DocumentBlockParser;
