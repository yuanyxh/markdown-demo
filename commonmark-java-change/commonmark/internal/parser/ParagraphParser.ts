import type { Block, SourceSpan } from "../../node";
import type {
  InlineParser,
  ParserState,
  SourceLine,
  SourceLines,
} from "../../parser";

import LinkReferenceDefinitionParser from "./LinkReferenceDefinitionParser";
import { DefinitionMap, LinkReferenceDefinition, Paragraph } from "../../node";
import { AbstractBlockParser, BlockContinue } from "../../parser";

class ParagraphParser extends AbstractBlockParser {
  private readonly block = new Paragraph();
  private readonly linkReferenceDefinitionParser =
    new LinkReferenceDefinitionParser();

  public override canHaveLazyContinuationLines(): boolean {
    return true;
  }

  public override getBlock(): Block {
    return this.block;
  }

  public override tryContinue(state: ParserState): BlockContinue | null {
    if (!state.isBlank()) {
      return BlockContinue.atIndex(state.getIndex());
    } else {
      return BlockContinue.none();
    }
  }

  public override addLine(line: SourceLine) {
    this.linkReferenceDefinitionParser.parse(line);
  }

  public override addSourceSpan(sourceSpan: SourceSpan) {
    // Some source spans might belong to link reference definitions, others to the paragraph.
    // The parser will handle that.
    this.linkReferenceDefinitionParser.addSourceSpan(sourceSpan);
  }

  public override getDefinitions(): DefinitionMap<any>[] {
    const map = new DefinitionMap(LinkReferenceDefinition);
    for (const def of this.linkReferenceDefinitionParser.getDefinitions()) {
      map.putIfAbsent(def.getLabel()!, def);
    }

    return [map];
  }

  public override closeBlock() {
    for (const def of this.linkReferenceDefinitionParser.getDefinitions()) {
      this.block.insertBefore(def);
    }

    if (this.linkReferenceDefinitionParser.getParagraphLines().isEmpty()) {
      this.block.unlink();
    } else {
      this.block.setSourceSpans(
        this.linkReferenceDefinitionParser.getParagraphSourceSpans()
      );
    }
  }

  public override parseInlines(inlineParser: InlineParser) {
    const lines = this.linkReferenceDefinitionParser.getParagraphLines();
    if (!lines.isEmpty()) {
      inlineParser.parse(lines, this.block);
    }
  }

  public getParagraphLines(): SourceLines {
    return this.linkReferenceDefinitionParser.getParagraphLines();
  }
}

export default ParagraphParser;
