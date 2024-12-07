import type { Text } from "../node";
import type { DelimiterRun } from "../parser";

/**
 * Delimiter (emphasis, strong emphasis or custom emphasis).
 *
 * 分隔符（强调、强烈强调或自定义强调）
 */
class Delimiter implements DelimiterRun {
  public readonly characters: Text[];
  public readonly delimiterChar: string;
  private readonly originalLength: number;

  // Can open emphasis, see spec.
  private readonly canOpen: boolean;

  // Can close emphasis, see spec.
  private readonly canClose: boolean;

  public previous: Delimiter | null = null;
  public next: Delimiter | null = null;

  public constructor(
    characters: Text[],
    delimiterChar: string,
    canOpen: boolean,
    canClose: boolean,
    previous: Delimiter | null
  ) {
    this.characters = characters;
    this.delimiterChar = delimiterChar;
    this.canOpen = canOpen;
    this.canClose = canClose;
    this.previous = previous;
    this.originalLength = characters.length;
  }

  /**
   * 是否可以打开一个强调
   *
   * @returns
   */
  public getCanOpen(): boolean {
    return this.canOpen;
  }

  /**
   * 是否可以关闭一个强调
   *
   * @returns
   */
  public getCanClose(): boolean {
    return this.canClose;
  }

  /**
   * 分割符中的字符长度
   *
   * @returns
   */
  public length(): number {
    return this.characters.length;
  }

  /**
   * 最初在此分隔符运行中的字符数；在处理开始时，与 {{@link #length()}} 相同
   *
   * @returns
   */
  public getOriginalLength(): number {
    return this.originalLength;
  }

  /**
   * 最内层的开始分隔符，例如对于 {@code ***}，这是最后一个 {@code *}
   *
   * @returns
   */
  public getOpener(): Text {
    return this.characters[this.characters.length - 1];
  }

  /**
   * 最内层的结束分隔符，例如对于 {@code ***}，这是第一个 {@code *}
   *
   * @returns
   */
  public getCloser(): Text {
    return this.characters[0];
  }

  /**
   * 获取指定范围的分割符
   *
   * @param length
   * @returns
   */
  public getOpeners(length: number): Text[] {
    if (!(length >= 1 && length <= this.length())) {
      throw Error(
        "length must be between 1 and " + this.length() + ", was " + length
      );
    }

    return this.characters.slice(
      this.characters.length - length,
      this.characters.length
    );
  }

  /**
   * 获取指定范围的分割符
   *
   * @param length
   * @returns
   */
  public getClosers(length: number): Text[] {
    if (!(length >= 1 && length <= this.length())) {
      throw Error(
        "length must be between 1 and " + this.length() + ", was " + length
      );
    }

    return this.characters.slice(0, length);
  }
}

export default Delimiter;
