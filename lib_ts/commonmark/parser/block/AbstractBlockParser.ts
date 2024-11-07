import type { BlockParser } from "./BlockParser";
import type { Block, DefinitionMap, SourceSpan } from "../../node";
import type SourceLine from "../SourceLine";
import type { InlineParser } from "../InlineParser";
import type { BlockContinue } from "../../internal";

abstract class AbstractBlockParser implements BlockParser {
  getBlock(): Block {
    throw new Error("Method not implemented.");
  }

  tryContinue(parserState): BlockContinue | null {
    throw new Error("Method not implemented.");
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

  public getDefinitions(): DefinitionMap<unknown>[] {
    return [];
  }

  public closeBlock() {}

  public parseInlines(inlineParser: InlineParser) {}
}

export default AbstractBlockParser;
