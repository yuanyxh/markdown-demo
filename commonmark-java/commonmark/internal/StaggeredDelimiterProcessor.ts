import type { DelimiterProcessor, DelimiterRun } from "@/parser";

/**
 * An implementation of DelimiterProcessor that dispatches all calls to two or more other DelimiterProcessors
 * depending on the length of the delimiter run. All child DelimiterProcessors must have different minimum
 * lengths. A given delimiter run is dispatched to the child with the largest acceptable minimum length. If no
 * child is applicable, the one with the largest minimum length is chosen.
 */
class StaggeredDelimiterProcessor implements DelimiterProcessor {
  private readonly delim: string;
  private minLength = 0;
  private processors: DelimiterProcessor[] = []; // in reverse getMinLength order

  public constructor(delim: string) {
    this.delim = delim;
  }

  public getOpeningCharacter(): string {
    return this.delim;
  }

  public getClosingCharacter(): string {
    return this.delim;
  }

  public getMinLength(): number {
    return this.minLength;
  }

  public add(dp: DelimiterProcessor) {
    let len = dp.getMinLength();
    let added = false;

    for (let i = 0; i < this.processors.length; i++) {
      const p = this.processors[i];
      const pLen = p.getMinLength();

      if (len > pLen) {
        this.processors.splice(i, 0, dp);
        added = true;
        break;
      } else if (len === pLen) {
        throw Error(
          "Cannot add two delimiter processors for char '" +
            this.delim +
            "' and minimum length " +
            len +
            "; conflicting processors: " +
            p +
            ", " +
            dp
        );
      }
    }

    if (!added) {
      this.processors.push(dp);
      this.minLength = len;
    }
  }

  private findProcessor(len: number): DelimiterProcessor {
    for (const p of this.processors) {
      if (p.getMinLength() <= len) {
        return p;
      }
    }

    return this.processors[0];
  }

  public process(openingRun: DelimiterRun, closingRun: DelimiterRun): number {
    return this.findProcessor(openingRun.length()).process(
      openingRun,
      closingRun
    );
  }
}

export default StaggeredDelimiterProcessor;
