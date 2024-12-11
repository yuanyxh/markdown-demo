import type { Appendable } from "../../../helpers";

import { fromCodePoint } from "../../../helpers";
import { Escaping } from "../../internal";

class HtmlWriter {
  private static readonly NO_ATTRIBUTES = new Map<string, string>();

  private readonly buffer: Appendable;
  private lastChar = fromCodePoint(0);

  public constructor(out: Appendable) {
    this.buffer = out;
  }

  public raw(s: string) {
    this.append(s);
  }

  public text(text: string) {
    this.append(Escaping.escapeHtml(text));
  }

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

  public line() {
    if (this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== "\n") {
      this.append("\n");
    }
  }

  protected append(s: string) {
    this.buffer.append(s);

    const length = s.length;
    if (length !== 0) {
      this.lastChar = s.charAt(length - 1);
    }
  }
}

export default HtmlWriter;
