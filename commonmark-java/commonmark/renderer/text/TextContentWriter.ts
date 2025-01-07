import type { Appendable } from "@/helpers/index";

import { fromCodePoint, isNotUnDef } from "@/helpers/index";

import LineBreakRendering from "./enums/LineBreakRendering";

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

  public whitespace() {
    if (this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== " ") {
      this.write(" ");
    }
  }

  public colon() {
    if (this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== ":") {
      this.write(":");
    }
  }

  public line() {
    this.append("\n");
  }

  public block() {
    this.blockSeparator =
      this.lineBreakRendering === LineBreakRendering.STRIP
        ? " " //
        : this.lineBreakRendering === LineBreakRendering.COMPACT ||
          this.isTight()
        ? "\n"
        : "\n\n";
  }

  public resetBlock() {
    this.blockSeparator = void 0;
  }

  public writeStripped(s: string) {
    this.write(s.replace(/[\r\n\s]+/g, " "));
  }

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
   */
  public pushTight(tight: boolean) {
    this.tight.push(tight);
  }

  /**
   * Remove the last "tight" setting from the top of the stack.
   */
  public popTight() {
    this.tight.pop();
  }

  private isTight(): boolean {
    return this.tight.length !== 0 && this.tight[this.tight.length - 1];
  }

  /**
   * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
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
