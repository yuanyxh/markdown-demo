import MarkdownNode from "../node";
import { escapeXml } from "../common";
import Renderer from "./renderer";

interface IHtmlRendererOptions {
  softbreak?: string;
  safe?: boolean;
  sourcepos?: boolean;
  esc?(s: string): string;
}

const reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
const reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

const potentiallyUnsafe = function (url: string) {
  return reUnsafeProtocol.test(url) && !reSafeDataProtocol.test(url);
};

class HtmlRenderer extends Renderer {
  options: IHtmlRendererOptions;

  disableTags = 0;
  lastOut = "\n";

  esc: (s: string) => string;

  constructor(options: IHtmlRendererOptions = {}) {
    super();

    // by default, soft breaks are rendered as newlines in HTML
    options.softbreak = options.softbreak || "\n";
    // set to "<br />" to make them hard breaks
    // set to " " if you want to ignore line wrapping in source
    this.esc = options.esc || escapeXml;
    // escape html with a custom function
    // else use escapeXml

    this.options = options;
  }

  text(node: MarkdownNode) {
    // TODO: new add
    if (node.literal === null) {
      throw new Error("Not have a node.literal.");
    }

    this.out(node.literal);
  }

  html_inline(node: MarkdownNode) {
    if (this.options.safe) {
      this.lit("<!-- raw HTML omitted -->");
    } else {
      // TODO: new add
      if (node.literal === null) {
        throw new Error("Not have a node.literal.");
      }

      this.lit(node.literal);
    }
  }

  html_block(node: MarkdownNode) {
    this.cr();

    if (this.options.safe) {
      this.lit("<!-- raw HTML omitted -->");
    } else {
      // TODO: new add
      if (node.literal === null) {
        throw new Error("Not have a node.literal.");
      }

      this.lit(node.literal);
    }

    this.cr();
  }

  softbreak() {
    // TODO: new add
    if (typeof this.options.softbreak === "undefined") {
      throw new Error("Not have a this.options.softbreak.");
    }

    this.lit(this.options.softbreak);
  }

  linebreak() {
    this.tag("br", [], true);
    this.cr();
  }

  link(node: MarkdownNode, entering: boolean) {
    const attrs = this.attrs(node);
    if (entering) {
      // TODO: new add
      if (node.destination === null) {
        throw new Error("Not have a node.destination.");
      }

      if (!(this.options.safe && potentiallyUnsafe(node.destination))) {
        attrs.push(["href", this.esc(node.destination)]);
      }

      if (node.title) {
        attrs.push(["title", this.esc(node.title)]);
      }

      this.tag("a", attrs);
    } else {
      this.tag("/a");
    }
  }

  image(node: MarkdownNode, entering: boolean) {
    if (entering) {
      if (this.disableTags === 0) {
        // TODO: new add
        if (node.destination === null) {
          throw new Error("Not have a node.destination.");
        }

        if (this.options.safe && potentiallyUnsafe(node.destination)) {
          this.lit('<img src="" alt="');
        } else {
          this.lit('<img src="' + this.esc(node.destination) + '" alt="');
        }
      }

      this.disableTags += 1;
    } else {
      this.disableTags -= 1;

      if (this.disableTags === 0) {
        if (node.title) {
          this.lit('" title="' + this.esc(node.title));
        }

        this.lit('" />');
      }
    }
  }

  emph(node: MarkdownNode, entering: boolean) {
    this.tag(entering ? "em" : "/em");
  }

  strong(node: MarkdownNode, entering: boolean) {
    this.tag(entering ? "strong" : "/strong");
  }

  paragraph(node: MarkdownNode, entering: boolean) {
    // TODO: new add
    if (node.parent === null) {
      throw new Error("Not have a node.parent.");
    }

    const grandparent = node.parent.parent;
    const attrs = this.attrs(node);

    if (grandparent !== null && grandparent.type === "list") {
      if (grandparent.listTight) {
        return;
      }
    }

    if (entering) {
      this.cr();
      this.tag("p", attrs);
    } else {
      this.tag("/p");
      this.cr();
    }
  }

  heading(node: MarkdownNode, entering: boolean) {
    const tagname = "h" + node.level,
      attrs = this.attrs(node);

    if (entering) {
      this.cr();
      this.tag(tagname, attrs);
    } else {
      this.tag("/" + tagname);
      this.cr();
    }
  }

  code(node: MarkdownNode) {
    // TODO: new add
    if (node.literal === null) {
      throw new Error("Not have a node.literal.");
    }

    this.tag("code");
    this.out(node.literal);
    this.tag("/code");
  }

  code_block(node: MarkdownNode) {
    // TODO: new add
    if (node.literal === null) {
      throw new Error("Not have a node.literal.");
    }

    const info_words = node.info ? node.info.split(/\s+/) : [];
    const attrs = this.attrs(node);

    if (info_words.length > 0 && info_words[0].length > 0) {
      let cls = this.esc(info_words[0]);

      if (!/^language-/.exec(cls)) {
        cls = "language-" + cls;
      }

      attrs.push(["class", cls]);
    }

    this.cr();
    this.tag("pre");
    this.tag("code", attrs);
    this.out(node.literal);
    this.tag("/code");
    this.tag("/pre");
    this.cr();
  }

  thematic_break(node: MarkdownNode) {
    const attrs = this.attrs(node);

    this.cr();
    this.tag("hr", attrs, true);
    this.cr();
  }

  block_quote(node: MarkdownNode, entering: boolean) {
    const attrs = this.attrs(node);

    if (entering) {
      this.cr();
      this.tag("blockquote", attrs);
      this.cr();
    } else {
      this.cr();
      this.tag("/blockquote");
      this.cr();
    }
  }

  list(node: MarkdownNode, entering: boolean) {
    const tagname = node.listType === "bullet" ? "ul" : "ol";
    const attrs = this.attrs(node);

    if (entering) {
      const start = node.listStart;

      if (typeof start !== "undefined" && start !== 1) {
        attrs.push(["start", start.toString()]);
      }

      this.cr();
      this.tag(tagname, attrs);
      this.cr();
    } else {
      this.cr();
      this.tag("/" + tagname);
      this.cr();
    }
  }

  item(node: MarkdownNode, entering: boolean) {
    const attrs = this.attrs(node);

    if (entering) {
      this.tag("li", attrs);
    } else {
      this.tag("/li");
      this.cr();
    }
  }

  custom_inline(node: MarkdownNode, entering: boolean) {
    if (entering && node.onEnter) {
      this.lit(node.onEnter);
    } else if (!entering && node.onExit) {
      this.lit(node.onExit);
    }
  }

  custom_block(node: MarkdownNode, entering: boolean) {
    this.cr();

    if (entering && node.onEnter) {
      this.lit(node.onEnter);
    } else if (!entering && node.onExit) {
      this.lit(node.onExit);
    }

    this.cr();
  }

  /* Helper methods */

  // Helper function to produce an HTML tag.
  tag(name: string, attrs?: TAttrs, selfclosing?: boolean) {
    if (this.disableTags > 0) {
      return;
    }

    this.buffer += "<" + name;

    if (attrs && attrs.length > 0) {
      let i = 0;
      let attrib: [string, string];

      while ((attrib = attrs[i]) !== undefined) {
        this.buffer += " " + attrib[0] + '="' + attrib[1] + '"';
        i++;
      }
    }

    if (selfclosing) {
      this.buffer += " /";
    }

    this.buffer += ">";
    this.lastOut = ">";
  }

  out(s: string) {
    this.lit(this.esc(s));
  }

  attrs(node: MarkdownNode) {
    const att: TAttrs = [];

    if (this.options.sourcepos) {
      const pos = node.sourcepos;
      if (pos) {
        att.push([
          "data-sourcepos",
          String(pos[0][0]) +
            ":" +
            String(pos[0][1]) +
            "-" +
            String(pos[1][0]) +
            ":" +
            String(pos[1][1]),
        ]);
      }
    }

    return att;
  }
}

export default HtmlRenderer;
