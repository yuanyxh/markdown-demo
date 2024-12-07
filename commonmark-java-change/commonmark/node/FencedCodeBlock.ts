import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";
import { isNotUnDef } from "../../helpers";

/**
 * 围栏代码块
 */
class FencedCodeBlock extends Block {
  private fenceCharacter: string | undefined;
  private openingFenceLength: number | undefined;
  private closingFenceLength: number | undefined;
  private fenceIndent: number | undefined;

  private info: string | undefined;
  private literal: string | undefined;

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取围栏代码块的标记字符（`、~）
   *
   * @return the fence character that was used, e.g. {@code `} or {@code ~}, if available, or null otherwise
   */
  public getFenceCharacter(): string | undefined {
    return this.fenceCharacter;
  }

  /**
   * 设置围栏代码块的标记字符
   *
   * @param fenceCharacter
   */
  public setFenceCharacter(fenceCharacter: string) {
    this.fenceCharacter = fenceCharacter;
  }

  /**
   * 获取开始的围栏代码块标记字符长度
   *
   * @return the length of the opening fence (how many of {{@link #getFenceCharacter()}} were used to start the code
   * block) if available, or null otherwise
   */
  public getOpeningFenceLength(): number | undefined {
    return this.openingFenceLength;
  }

  /**
   * 设置开始的围栏代码块标记字符长度
   *
   * @param openingFenceLength
   */
  public setOpeningFenceLength(openingFenceLength: number | undefined) {
    if (isNotUnDef(openingFenceLength) && openingFenceLength < 3) {
      throw Error("openingFenceLength needs to be >= 3");
    }

    FencedCodeBlock.checkFenceLengths(
      openingFenceLength,
      this.closingFenceLength
    );

    this.openingFenceLength = openingFenceLength;
  }

  /**
   * 获取结束的围栏代码块标记字符长度
   *
   * @return the length of the closing fence (how many of {@link #getFenceCharacter()} were used to end the code
   * block) if available, or null otherwise
   */
  public getClosingFenceLength(): number | undefined {
    return this.closingFenceLength;
  }

  /**
   * 设置结束的围栏代码块标记字符长度
   *
   * @param closingFenceLength
   */
  public setClosingFenceLength(closingFenceLength: number | undefined) {
    if (isNotUnDef(closingFenceLength) && closingFenceLength < 3) {
      throw Error("closingFenceLength needs to be >= 3");
    }

    FencedCodeBlock.checkFenceLengths(
      this.openingFenceLength,
      closingFenceLength
    );
    this.closingFenceLength = closingFenceLength;
  }

  /**
   * 获取围栏代码块的缩进
   *
   * @returns
   */
  public getFenceIndent(): number | undefined {
    return this.fenceIndent;
  }

  /**
   * 设置围栏代码块的缩进
   *
   * @param fenceIndent
   */
  public setFenceIndent(fenceIndent: number) {
    this.fenceIndent = fenceIndent;
  }

  /**
   * 获取围栏代码块的信息字符串（如 ```js）
   *
   * @see <a href="http://spec.commonmark.org/0.31.2/#info-string">CommonMark spec</a>
   */
  public getInfo(): string | undefined {
    return this.info;
  }

  /**
   * 设置围栏代码块的信息字符串
   *
   * @param info
   */
  public setInfo(info: string) {
    this.info = info;
  }

  /**
   * 获取围栏代码块的内容
   *
   * @returns
   */
  public getLiteral(): string | undefined {
    return this.literal;
  }

  /**
   * 设置围栏代码块的内容
   *
   * @param literal
   */
  public setLiteral(literal: string) {
    this.literal = literal;
  }

  /**
   * 检查开始和结束的围栏代码块标记长度
   *
   * @param openingFenceLength
   * @param closingFenceLength
   */
  private static checkFenceLengths(
    openingFenceLength: number | undefined,
    closingFenceLength: number | undefined
  ) {
    if (isNotUnDef(openingFenceLength) && isNotUnDef(closingFenceLength)) {
      if (closingFenceLength < openingFenceLength) {
        throw Error(
          "fence lengths required to be: closingFenceLength >= openingFenceLength"
        );
      }
    }
  }
}

export default FencedCodeBlock;
