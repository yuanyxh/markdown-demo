import {
  Block,
  DefinitionMap,
  LinkReferenceDefinition,
  Paragraph,
  SourceSpan,
} from "../node";
import {
  AbstractBlockParser,
  BlockContinue,
  InlineParser,
  ParserState,
  SourceLine,
  SourceLines,
} from "../parser";
import LinkReferenceDefinitionParser from "./LinkReferenceDefinitionParser";

class ParagraphParser extends AbstractBlockParser {
  private readonly block = new Paragraph();
  private readonly linkReferenceDefinitionParser =
    new LinkReferenceDefinitionParser();

  public canHaveLazyContinuationLines(): boolean {
    return true;
  }

  public getBlock(): Block {
    return this.block;
  }

  public tryContinue(state: ParserState): BlockContinue | null {
    if (!state.isBlank()) {
      return BlockContinue.atIndex(state.getIndex());
    } else {
      return BlockContinue.none();
    }
  }

  public addLine(line: SourceLine) {
    this.linkReferenceDefinitionParser.parse(line);
  }

  public addSourceSpan(sourceSpan: SourceSpan) {
    // Some source spans might belong to link reference definitions, others to the paragraph.
    // The parser will handle that.
    this.linkReferenceDefinitionParser.addSourceSpan(sourceSpan);
  }

  public getDefinitions(): DefinitionMap<unknown>[] {
    let map = new DefinitionMap(LinkReferenceDefinition);
    for (const def of this.linkReferenceDefinitionParser.getDefinitions()) {
      map.putIfAbsent(def.getLabel()!, def as any);
    }

    return [map];
  }

  public closeBlock(): void {
    for (let def of this.linkReferenceDefinitionParser.getDefinitions()) {
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

  public parseInlines(inlineParser: InlineParser) {
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
