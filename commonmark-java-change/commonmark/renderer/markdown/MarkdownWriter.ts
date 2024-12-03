import type { Appendable } from "../../../helpers";
import type { CharMatcher } from "../../text";

import { fromCodePoint } from "../../../helpers";

/**
 * Writer for Markdown (CommonMark) text.
 *
 * Markdown (CommonMark) 文本的编写器
 */
class MarkdownWriter {
  private readonly buffer: Appendable;

  private blockSeparator = 0;
  private lastChar = fromCodePoint(0);
  private atLineStart = true;

  // Stacks of settings that affect various rendering behaviors. The common pattern here is that callers use "push" to
  // change a setting, render some nodes, and then "pop" the setting off the stack again to restore previous state.

  // 影响各种渲染行为的设置堆栈；这里的常见模式是调用者使用 push 来更改设置，渲染一些节点，然后再次将设置从堆栈中 pop 以恢复之前的状态。
  private readonly prefixes: string[] = [];
  private readonly tight: boolean[] = [];
  private readonly rawEscapes: CharMatcher[] = [];

  public constructor(out: Appendable) {
    this.buffer = out;
  }

  /**
   * Write the supplied string (raw/unescaped except if {@link #pushRawEscape} was used).
   *
   * 写入提供的字符串（原始/未转义，除非使用了 {@link #pushRawEscape}）
   */
  public raw(s: string): void {
    this.flushBlockSeparator();
    this.write(s, null);
  }

  /**
   * Write the supplied string with escaping.
   *
   * 使用转义写入提供的字符串
   *
   * @param s      the string to write
   * @param escape which characters to escape
   */
  public text(s: string, escape: CharMatcher) {
    if (s === "") {
      return;
    }

    this.flushBlockSeparator();
    this.write(s, escape);

    this.lastChar = s.charAt(s.length - 1);
    this.atLineStart = false;
  }

  /**
   * Write a newline (line terminator).
   *
   * 写入换行符
   */
  public line() {
    this.write("\n", null);
    this.writePrefixes();
    this.atLineStart = true;
  }

  /**
   * Enqueue a block separator to be written before the next text is written. Block separators are not written
   * straight away because if there are no more blocks to write we don't want a separator (at the end of the document).
   *
   * 设置块分割符
   */
  public block() {
    // Remember whether this should be a tight or loose separator now because tight could get changed in between
    // this and the next flush.
    this.blockSeparator = this.isTight() ? 1 : 2;
    this.atLineStart = true;
  }

  /**
   * Push a prefix onto the top of the stack. All prefixes are written at the beginning of each line, until the
   * prefix is popped again.
   *
   * 设置每行开头的字符
   *
   * @param prefix the raw prefix string
   */
  public pushPrefix(prefix: string) {
    this.prefixes.push(prefix);
  }

  /**
   * Write a prefix.
   *
   * 写入前缀
   *
   * @param prefix the raw prefix string to write
   */
  public writePrefix(prefix: string): void {
    let tmp: boolean = this.atLineStart;
    this.raw(prefix);
    this.atLineStart = tmp;
  }

  /**
   * Remove the last prefix from the top of the stack.
   *
   * 移除前缀
   */
  public popPrefix() {
    this.prefixes.pop();
  }

  /**
   * Change whether blocks are tight or loose. Loose is the default where blocks are separated by a blank line. Tight
   * is where blocks are not separated by a blank line. Tight blocks are used in lists, if there are no blank lines
   * within the list.
   * <p>
   * Note that changing this does not affect block separators that have already been enqueued with {@link #block()},
   * only future ones.
   *
   * 设置间隔模式是紧凑还是松散的
   */
  public pushTight(tight: boolean) {
    this.tight.push(tight);
  }

  /**
   * Remove the last "tight" setting from the top of the stack.
   *
   * 移除设置的间隔模式
   */
  public popTight() {
    this.tight.pop();
  }

  /**
   * Escape the characters matching the supplied matcher, in all text (text and raw). This might be useful to
   * extensions that add another layer of syntax, e.g. the tables extension that uses `|` to separate cells and needs
   * all `|` characters to be escaped (even in code spans).
   *
   * @param rawEscape the characters to escape in raw text
   */
  public pushRawEscape(rawEscape: CharMatcher) {
    this.rawEscapes.push(rawEscape);
  }

  /**
   * Remove the last raw escape from the top of the stack.
   */
  public popRawEscape(): void {
    this.rawEscapes.pop();
  }

  /**
   * @return the last character that was written
   */
  public getLastChar(): string {
    return this.lastChar;
  }

  /**
   * @return whether we're at the line start (not counting any prefixes), i.e. after a {@link #line} or {@link #block}.
   */
  public isAtLineStart(): boolean {
    return this.atLineStart;
  }

  private write(s: string, escape: CharMatcher | null) {
    if (this.rawEscapes.length === 0 && escape === null) {
      // Normal fast path
      this.buffer.append(s);
    } else {
      for (let i = 0; i < s.length; i++) {
        this.append(s.charAt(i), escape);
      }
    }

    const length = s.length;
    if (length !== 0) {
      this.lastChar = s.charAt(length - 1);
    }

    this.atLineStart = false;
  }

  private writePrefixes() {
    if (this.prefixes.length) {
      for (let prefix of this.prefixes) {
        this.write(prefix, null);
      }
    }
  }

  /**
   * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
   */
  private flushBlockSeparator(): void {
    if (this.blockSeparator !== 0) {
      this.write("\n", null);
      this.writePrefixes();

      if (this.blockSeparator > 1) {
        this.write("\n", null);
        this.writePrefixes();
      }

      this.blockSeparator = 0;
    }
  }

  private append(c: string, escape: CharMatcher | null) {
    if (this.needsEscaping(c, escape)) {
      if (c === "\n") {
        // Can't escape this with \, use numeric character reference
        this.buffer.append("&#10;");
      } else {
        this.buffer.append("\\");
        this.buffer.append(c);
      }
    } else {
      this.buffer.append(c);
    }
  }

  private isTight(): boolean {
    return this.tight.length !== 0 && this.tight[this.tight.length - 1];
  }

  private needsEscaping(c: string, escape: CharMatcher | null): boolean {
    return (escape !== null && escape.matches(c)) || this.rawNeedsEscaping(c);
  }

  private rawNeedsEscaping(c: string): boolean {
    for (let rawEscape of this.rawEscapes) {
      if (rawEscape.matches(c)) {
        return true;
      }
    }

    return false;
  }
}

export default MarkdownWriter;
