/**
 * An implementation of DelimiterProcessor that dispatches all calls to two or more other DelimiterProcessors
 * depending on the length of the delimiter run. All child DelimiterProcessors must have different minimum
 * lengths. A given delimiter run is dispatched to the child with the largest acceptable minimum length. If no
 * child is applicable, the one with the largest minimum length is chosen.
 */
export class StaggeredDelimiterProcessor
  extends JavaObject
  implements DelimiterProcessor
{
  private readonly delim: char;
  private minLength: int = 0;
  private processors: java.util.LinkedList<DelimiterProcessor> | null =
    new java.util.LinkedList(); // in reverse getMinLength order

  protected constructor(delim: char) {
    super();
    this.delim = delim;
  }

  public getOpeningCharacter(): char {
    return this.delim;
  }

  public getClosingCharacter(): char {
    return this.delim;
  }

  public getMinLength(): int {
    return this.minLength;
  }

  protected add(dp: DelimiterProcessor | null): void {
    let len: int = dp.getMinLength();
    let it: java.util.ListIterator<DelimiterProcessor> =
      this.processors.listIterator();
    let added: boolean = false;
    while (it.hasNext()) {
      let p: DelimiterProcessor = it.next();
      let pLen: int = p.getMinLength();
      if (len > pLen) {
        it.previous();
        it.add(dp);
        added = true;
        break;
      } else if (len === pLen) {
        throw new java.lang.IllegalArgumentException(
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
      this.processors.add(dp);
      this.minLength = len;
    }
  }

  private findProcessor(len: int): DelimiterProcessor | null {
    for (let p of this.processors) {
      if (p.getMinLength() <= len) {
        return p;
      }
    }
    return this.processors.getFirst();
  }

  public process(
    openingRun: DelimiterRun | null,
    closingRun: DelimiterRun | null
  ): int {
    return this.findProcessor(openingRun.length()).process(
      openingRun,
      closingRun
    );
  }
}
