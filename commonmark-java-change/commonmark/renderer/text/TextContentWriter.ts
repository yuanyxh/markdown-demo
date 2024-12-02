import type { Appendable } from "../../../helpers";

import { fromCodePoint, isNotUnDef } from "../../../helpers";
import LineBreakRendering from "./enums/LineBreakRendering";

/**
 * TextContent 写入输出器
 */
class TextContentWriter {
  private readonly buffer: Appendable;
  private readonly lineBreakRendering: LineBreakRendering;

  private readonly tight: boolean[] = [];

  private blockSeparator: string | undefined;
  private lastChar = fromCodePoint(0);

  public constructor(
    out: Appendable,
    lineBreakRendering = LineBreakRendering.COMPACT
  ) {
    this.buffer = out;
    this.lineBreakRendering = lineBreakRendering;
  }

  /**
   * 空白字符作为空格写入
   */
  public whitespace() {
    if (this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== " ") {
      this.write(" ");
    }
  }

  /**
   * 写入冒号 :
   */
  public colon() {
    if (this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== ":") {
      this.write(":");
    }
  }

  /**
   * 写入换行符
   */
  public line() {
    this.append("\n");
  }

  /**
   * 写入块换行符，根据 LineBreakRendering 值
   */
  public block() {
    this.blockSeparator =
      this.lineBreakRendering === LineBreakRendering.STRIP
        ? " " //
        : this.lineBreakRendering === LineBreakRendering.COMPACT ||
          this.isTight()
        ? "\n"
        : "\n\n";
  }

  /**
   * 重置块换行符
   */
  public resetBlock() {
    this.blockSeparator = void 0;
  }

  /**
   * 将换行符或空格作为空格写入
   *
   * @param s
   */
  public writeStripped(s: string) {
    this.write(s.replace(/[\r\n\s]+/g, " "));
  }

  /**
   * 写入字符数据
   *
   * @param s
   */
  public write(s: string) {
    this.flushBlockSeparator();
    this.append(s);
  }

  /**
   * Change whether blocks are tight or loose. Loose is the default where blocks are separated by a blank line. Tight
   * is where blocks are not separated by a blank line. Tight blocks are used in lists, if there are no blank lines
   * within the list.
   * <p>
   * Note that changing this does not affect block separators that have already been enqueued with {@link #block()},
   * only future ones.
   *
   * 设置块是紧凑的还是松散的；松散是默认设置，块之间用空行分隔
   * 紧凑即块不被空行分隔，如果没有空行，即列表项不被空行分割
   */
  public pushTight(tight: boolean) {
    this.tight.push(tight);
  }

  /**
   * Remove the last "tight" setting from the top of the stack.
   *
   * 从堆栈顶部删除最后一个 紧凑 的设置。
   */
  public popTight() {
    this.tight.pop();
  }

  /**
   * 判断栈顶是否是紧凑的
   *
   * @returns
   */
  private isTight(): boolean {
    return this.tight.length !== 0 && this.tight[this.tight.length - 1];
  }

  /**
   * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
   *
   * 如果块分隔符已使用 {@link #block()} 排队但尚未写入，请立即写入
   */
  private flushBlockSeparator() {
    if (isNotUnDef(this.blockSeparator)) {
      this.append(this.blockSeparator);
      this.blockSeparator = void 0;
    }
  }

  private append(s: string) {
    this.buffer.append(s);

    const length = s.length;
    if (length !== 0) {
      this.lastChar = s.charAt(length - 1);
    }
  }
}

export default TextContentWriter;
