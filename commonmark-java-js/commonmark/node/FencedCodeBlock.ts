import type { Visitor } from './interfaces/Visitor';

import { isNotUnDef } from '@helpers/index';

import Block from './abstracts/Block';

class FencedCodeBlock extends Block {
  private fenceCharacter: string | undefined;
  private openingFenceLength: number | undefined;
  private closingFenceLength: number | undefined;
  private fenceIndent: number | undefined;

  private info: string | undefined;
  private literal: string = '';

  constructor() {
    super('fenced-code-block');
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the fence character that was used, e.g. {@code `} or {@code ~}, if available, or null otherwise
   */
  getFenceCharacter(): string | undefined {
    return this.fenceCharacter;
  }

  /**
   * @param fenceCharacter
   */
  setFenceCharacter(fenceCharacter: string) {
    this.fenceCharacter = fenceCharacter;
  }

  /**
   * @return the length of the opening fence (how many of {{@link #getFenceCharacter()}} were used to start the code
   * block) if available, or null otherwise
   */
  getOpeningFenceLength(): number | undefined {
    return this.openingFenceLength;
  }

  /**
   * @param openingFenceLength
   */
  setOpeningFenceLength(openingFenceLength: number | undefined) {
    if (isNotUnDef(openingFenceLength) && openingFenceLength < 3) {
      throw Error('openingFenceLength needs to be >= 3');
    }

    FencedCodeBlock.checkFenceLengths(openingFenceLength, this.closingFenceLength);

    this.openingFenceLength = openingFenceLength;
  }

  /**
   * @return the length of the closing fence (how many of {@link #getFenceCharacter()} were used to end the code
   * block) if available, or null otherwise
   */
  getClosingFenceLength(): number | undefined {
    return this.closingFenceLength;
  }

  setClosingFenceLength(closingFenceLength: number | undefined) {
    if (isNotUnDef(closingFenceLength) && closingFenceLength < 3) {
      throw Error('closingFenceLength needs to be >= 3');
    }

    FencedCodeBlock.checkFenceLengths(this.openingFenceLength, closingFenceLength);
    this.closingFenceLength = closingFenceLength;
  }

  getFenceIndent(): number | undefined {
    return this.fenceIndent;
  }

  setFenceIndent(fenceIndent: number) {
    this.fenceIndent = fenceIndent;
  }

  /**
   * @see <a href="http://spec.commonmark.org/0.31.2/#info-string">CommonMark spec</a>
   */
  getInfo(): string | undefined {
    return this.info;
  }

  setInfo(info: string) {
    this.info = info;
  }

  getLiteral(): string {
    return this.literal;
  }

  setLiteral(literal: string) {
    this.literal = literal;
  }

  private static checkFenceLengths(
    openingFenceLength: number | undefined,
    closingFenceLength: number | undefined
  ) {
    if (isNotUnDef(openingFenceLength) && isNotUnDef(closingFenceLength)) {
      if (closingFenceLength < openingFenceLength) {
        throw Error('fence lengths required to be: closingFenceLength >= openingFenceLength');
      }
    }
  }
}

export default FencedCodeBlock;
