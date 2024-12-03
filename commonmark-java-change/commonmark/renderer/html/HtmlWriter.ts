import type { Appendable } from "../../../helpers";

import { fromCodePoint } from "../../../helpers";
import { Escaping } from "../../internal";

/**
 * html 写入器
 */
class HtmlWriter {
  private static readonly NO_ATTRIBUTES = new Map<string, string>();

  private readonly buffer: Appendable;
  private lastChar = fromCodePoint(0);

  public constructor(out: Appendable) {
    this.buffer = out;
  }

  /**
   * 写入原始文本
   *
   * @param s
   */
  public raw(s: string) {
    this.append(s);
  }

  /**
   * 写入文本（对 html 标记字符进行编码保证安全）
   *
   * @param text
   */
  public text(text: string) {
    this.append(Escaping.escapeHtml(text));
  }

  /**
   * 写入一个 html 标记
   *
   * @param name
   * @param attrs
   * @param voidElement
   */
  public tag(
    name: string,
    attrs = HtmlWriter.NO_ATTRIBUTES,
    voidElement = false
  ) {
    this.append("<");
    this.append(name);

    if (attrs.size) {
      for (const attr of attrs) {
        this.append(" ");
        this.append(Escaping.escapeHtml(attr[0]));

        this.append('="');
        this.append(Escaping.escapeHtml(attr[1]));
        this.append('"');
      }
    }

    if (voidElement) {
      this.append(" /");
    }

    this.append(">");
  }

  /**
   * 写入换行符
   */
  public line() {
    if (this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== "\n") {
      this.append("\n");
    }
  }

  /**
   * 追加文本
   *
   * @param s
   */
  protected append(s: string) {
    this.buffer.append(s);

    const length = s.length;
    if (length !== 0) {
      this.lastChar = s.charAt(length - 1);
    }
  }
}

export default HtmlWriter;
