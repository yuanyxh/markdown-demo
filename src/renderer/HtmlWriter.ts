import type { Appendable } from 'commonmark-java-js';

import { Escaping } from 'commonmark-java-js';

class HtmlWriter {
  private static readonly NO_ATTRIBUTES = new Map<string, string>();

  private readonly buffer: Appendable;

  public constructor(out: Appendable) {
    this.buffer = out;
  }

  public raw(s: string) {
    this.append(s);
  }

  public text(text: string) {
    this.append(Escaping.escapeHtml(text));
  }

  public tag(name: string, attrs = HtmlWriter.NO_ATTRIBUTES, voidElement = false) {
    this.append('<');
    this.append(name);

    if (attrs.size) {
      for (const attr of attrs) {
        this.append(' ');
        this.append(Escaping.escapeHtml(attr[0]));

        this.append('="');
        this.append(Escaping.escapeHtml(attr[1]));
        this.append('"');
      }
    }

    if (voidElement) {
      this.append(' /');
    }

    this.append('>');
  }

  protected append(s: string) {
    this.buffer.append(s);
  }
}

export default HtmlWriter;
