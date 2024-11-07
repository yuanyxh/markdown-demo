import Block from "./Block";
import { Visitor } from "./Visitor";

class FencedCodeBlock extends Block {
  private fenceCharacter = "";
  private openingFenceLength = -1;
  private closingFenceLength = -1;
  private fenceIndent = -1;

  private info = "";
  private literal = "";

  public accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the fence character that was used, e.g. {@code `} or {@code ~}, if available, or null otherwise
   */
  public getFenceCharacter(): string {
    return this.fenceCharacter;
  }

  public setFenceCharacter(fenceCharacter: string): void {
    this.fenceCharacter = fenceCharacter;
  }

  /**
   * @return the length of the opening fence (how many of {{@link #getFenceCharacter()}} were used to start the code
   * block) if available, or null otherwise
   */
  public getOpeningFenceLength(): number {
    return this.openingFenceLength;
  }

  public setOpeningFenceLength(openingFenceLength: number) {
    if (openingFenceLength !== null && openingFenceLength < 3) {
      throw Error("openingFenceLength needs to be >= 3");
    }

    FencedCodeBlock.checkFenceLengths(
      openingFenceLength,
      this.closingFenceLength
    );

    this.openingFenceLength = openingFenceLength;
  }

  /**
   * @return the length of the closing fence (how many of {@link #getFenceCharacter()} were used to end the code
   * block) if available, or null otherwise
   */
  public getClosingFenceLength(): number {
    return this.closingFenceLength;
  }

  public setClosingFenceLength(closingFenceLength: number): void {
    if (closingFenceLength !== null && closingFenceLength < 3) {
      throw Error("closingFenceLength needs to be >= 3");
    }

    FencedCodeBlock.checkFenceLengths(
      this.openingFenceLength,
      closingFenceLength
    );
    this.closingFenceLength = closingFenceLength;
  }

  public getFenceIndent(): number {
    return this.fenceIndent;
  }

  public setFenceIndent(fenceIndent: number) {
    this.fenceIndent = fenceIndent;
  }

  /**
   * @see <a href="http://spec.commonmark.org/0.31.2/#info-string">CommonMark spec</a>
   */
  public getInfo(): string {
    return this.info;
  }

  public setInfo(info: string) {
    this.info = info;
  }

  public getLiteral(): string {
    return this.literal;
  }

  public setLiteral(literal: string) {
    this.literal = literal;
  }

  /**
   * @deprecated use {@link #getFenceCharacter()} instead
   */
  public getFenceChar(): string {
    return this.fenceCharacter !== "" ? this.fenceCharacter.charAt(0) : "\0";
  }

  /**
   * @deprecated use {@link #setFenceCharacter} instead
   */
  public setFenceChar(fenceChar: string): void {
    this.fenceCharacter = fenceChar !== "\0" ? fenceChar : "";
  }

  /**
   * @deprecated use {@link #getOpeningFenceLength} instead
   */
  public getFenceLength(): number {
    return this.openingFenceLength !== -1 ? this.openingFenceLength : 0;
  }

  /**
   * @deprecated use {@link #setOpeningFenceLength} instead
   */
  public setFenceLength(fenceLength: number): void {
    this.openingFenceLength = fenceLength !== 0 ? fenceLength : -1;
  }

  private static checkFenceLengths(
    openingFenceLength: number,
    closingFenceLength: number
  ) {
    if (openingFenceLength !== -1 && closingFenceLength !== -1) {
      if (closingFenceLength < openingFenceLength) {
        throw Error(
          "fence lengths required to be: closingFenceLength >= openingFenceLength"
        );
      }
    }
  }
}

export default FencedCodeBlock;
