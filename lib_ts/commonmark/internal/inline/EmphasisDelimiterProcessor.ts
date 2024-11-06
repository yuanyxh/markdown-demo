import { Emphasis, Node, Nodes, SourceSpans, StrongEmphasis } from "../../node";
import { DelimiterProcessor } from "../../parser/delimiter/DelimiterProcessor";
import { DelimiterRun } from "../../parser/delimiter/DelimiterRun";

abstract class EmphasisDelimiterProcessor implements DelimiterProcessor {
  private readonly delimiterChar: string;

  protected constructor(delimiterChar: string) {
    this.delimiterChar = delimiterChar;
  }

  public getOpeningCharacter(): string {
    return this.delimiterChar;
  }

  public getClosingCharacter(): string {
    return this.delimiterChar;
  }

  public getMinLength(): number {
    return 1;
  }

  public process(openingRun: DelimiterRun, closingRun: DelimiterRun): number {
    // "multiple of 3" rule for internal delimiter runs
    if (
      (openingRun.canClose() || closingRun.canOpen()) &&
      closingRun.originalLength() % 3 !== 0 &&
      (openingRun.originalLength() + closingRun.originalLength()) % 3 === 0
    ) {
      return 0;
    }

    let usedDelimiters: number;
    let emphasis: Node;
    // calculate actual number of delimiters used from this closer
    if (openingRun.length() >= 2 && closingRun.length() >= 2) {
      usedDelimiters = 2;

      emphasis = new StrongEmphasis(this.delimiterChar + this.delimiterChar);
    } else {
      usedDelimiters = 1;

      emphasis = new Emphasis(this.delimiterChar);
    }

    const sourceSpans = SourceSpans.empty();
    sourceSpans.addAllFrom(openingRun.getOpeners(usedDelimiters));

    const opener = openingRun.getOpener();

    for (const node of Nodes.between(opener, closingRun.getCloser())) {
      emphasis.appendChild(node);
      sourceSpans.addAll(node.getSourceSpans());
    }

    sourceSpans.addAllFrom(closingRun.getClosers(usedDelimiters));

    emphasis.setSourceSpans(sourceSpans.getSourceSpans());
    opener.insertAfter(emphasis);

    return usedDelimiters;
  }
}

export default EmphasisDelimiterProcessor;
