import type SourceLine from "../parser_utils/SourceLine";
import type { BlockParser } from "../interfaces/BlockParser";
import type { Block, DefinitionMap, SourceSpan } from "../../node";
import type { InlineParser } from "../interfaces/InlineParser";
import type { BlockContinue } from "../../parser";
import type { ParserState } from "../interfaces/ParserState";

abstract class AbstractBlockParser implements BlockParser {
  getBlock(): Block {
    throw new Error("Method not implemented.");
  }

  tryContinue(parserState: ParserState): BlockContinue | null {
    return null;
  }

  public isContainer(): boolean {
    return false;
  }

  public canHaveLazyContinuationLines(): boolean {
    return false;
  }

  public canContain(childBlock: Block): boolean {
    return false;
  }

  public addLine(line: SourceLine) {}

  public addSourceSpan(sourceSpan: SourceSpan) {
    this.getBlock().addSourceSpan(sourceSpan);
  }

  public getDefinitions(): DefinitionMap<any>[] {
    return [];
  }

  public closeBlock() {}

  public parseInlines(inlineParser: InlineParser) {}
}

export default AbstractBlockParser;