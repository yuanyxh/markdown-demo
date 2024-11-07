import { BlockParser } from "./BlockParser";
import { Block, DefinitionMap, SourceSpan } from "../../node";
import SourceLine from "../SourceLine";
import BlockContinue from "./BlockContinue";
import { InlineParser } from "../InlineParser";

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

  public addLine(line: SourceLine): void {}

  public addSourceSpan(sourceSpan: SourceSpan): void {
    this.getBlock().addSourceSpan(sourceSpan);
  }

  public getDefinitions(): DefinitionMap<unknown>[] {
    return [];
  }

  public closeBlock(): void {}

  public parseInlines(inlineParser: InlineParser) {}
}

export default AbstractBlockParser;
