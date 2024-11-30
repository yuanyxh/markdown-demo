"use strict";

import Renderer from "./renderer";
import { escapeXml } from "../common";
import MarkdownNode from "../node";

import type { IWalker } from "../node";

interface IXmlRendererOptions {
  esc?(s: string): string;
  time?: boolean;
  sourcepos?: boolean;
}

const reXMLTag = /\<[^>]*\>/;

function toTagName(s: string) {
  return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

class XmlRenderer extends Renderer {
  disableTags: number;
  indentLevel: number;
  indent: string;

  options: IXmlRendererOptions;

  esc: (s: string) => string;

  constructor(options: IXmlRendererOptions = {}) {
    super();

    this.options = options;

    this.disableTags = 0;
    this.lastOut = "\n";

    this.indentLevel = 0;
    this.indent = "  ";

    // escape html with a custom function
    // else use escapeXml
    this.esc = options.esc || escapeXml;
  }

  render(ast: MarkdownNode) {
    this.buffer = "";

    let attrs: TAttrs;
    let tagname: string;
    const walker = ast.walker();

    let event: IWalker | null;
    let node: MarkdownNode;
    let entering: boolean;
    let container: boolean;
    let selfClosing: boolean;
    let nodetype: string;

    const options = this.options;

    if (options.time) {
      console.time("rendering");
    }

    this.buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
    this.buffer += '<!DOCTYPE document SYSTEM "CommonMark.dtd">\n';

    while ((event = walker.next())) {
      entering = event.entering;
      node = event.node;
      nodetype = node.type;

      container = node.isContainer;

      selfClosing =
        nodetype === "thematic_break" ||
        nodetype === "linebreak" ||
        nodetype === "softbreak";

      tagname = toTagName(nodetype);

      if (entering) {
        attrs = [];

        switch (nodetype) {
          case "document":
            attrs.push(["xmlns", "http://commonmark.org/xml/1.0"]);
            break;
          case "list":
            if (typeof node.listType !== "undefined") {
              attrs.push(["type", node.listType.toLowerCase()]);
            }

            if (typeof node.listStart !== "undefined") {
              attrs.push(["start", String(node.listStart)]);
            }

            if (typeof node.listTight !== "undefined") {
              attrs.push(["tight", node.listTight ? "true" : "false"]);
            }

            const delim = node.listDelimiter;
            if (delim !== null) {
              let delimword = "";

              if (delim === ".") {
                delimword = "period";
              } else {
                delimword = "paren";
              }

              attrs.push(["delimiter", delimword]);
            }

            break;
          case "code_block":
            if (node.info) {
              attrs.push(["info", node.info]);
            }

            break;
          case "heading":
            attrs.push(["level", String(node.level)]);

            break;
          case "link":
          case "image":
            // TODO: new add
            if (node.destination === null || node.title === null) {
              throw new Error("Not have a destination or title.");
            }

            attrs.push(["destination", node.destination]);
            attrs.push(["title", node.title]);

            break;
          case "custom_inline":
          case "custom_block":
            // TODO: new add
            if (node.onEnter === null || node.onExit === null) {
              throw new Error("Not have a onEnter or onExit.");
            }

            attrs.push(["on_enter", node.onEnter]);
            attrs.push(["on_exit", node.onExit]);

            break;
          default:
            break;
        }
        if (options.sourcepos) {
          const pos = node.sourcepos;

          if (pos) {
            attrs.push([
              "sourcepos",
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

        this.cr();

        this.out(this.tag(tagname, attrs, selfClosing));

        if (container) {
          this.indentLevel += 1;
        } else if (!container && !selfClosing) {
          const lit = node.literal;

          if (lit) {
            this.out(this.esc(lit));
          }

          this.out(this.tag("/" + tagname));
        }
      } else {
        this.indentLevel -= 1;
        this.cr();
        this.out(this.tag("/" + tagname));
      }
    }

    if (options.time) {
      console.timeEnd("rendering");
    }

    this.buffer += "\n";

    return this.buffer;
  }

  out(s: string) {
    if (this.disableTags > 0) {
      this.buffer += s.replace(reXMLTag, "");
    } else {
      this.buffer += s;
    }

    this.lastOut = s;
  }

  cr() {
    if (this.lastOut !== "\n") {
      this.buffer += "\n";
      this.lastOut = "\n";

      for (let i = this.indentLevel; i > 0; i--) {
        this.buffer += this.indent;
      }
    }
  }

  // Helper function to produce an XML tag.
  tag(name: string, attrs?: TAttrs, selfclosing?: boolean) {
    let result = "<" + name;

    if (attrs && attrs.length > 0) {
      let i = 0;
      let attrib: [string, string];

      while ((attrib = attrs[i]) !== undefined) {
        result += " " + attrib[0] + '="' + this.esc(attrib[1]) + '"';
        i++;
      }
    }

    if (selfclosing) {
      result += " /";
    }

    result += ">";

    return result;
  }
}

export default XmlRenderer;
