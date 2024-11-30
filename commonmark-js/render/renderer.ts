import MarkdownNode from "../node";
import type { IWalker } from "../node";

class Renderer {
  buffer = "";
  lastOut = "";

  private readonly typeRender = (node: MarkdownNode, entering: boolean) => {};

  /**
   *  Walks the AST and calls member methods for each MarkdownNode type.
   *
   *  @param ast {MarkdownNode} The root of the abstract syntax tree.
   */
  readonly render = (ast: MarkdownNode) => {
    const walker = ast.walker();

    let event: IWalker | null;
    let type: string;

    this.buffer = "";
    this.lastOut = "\n";

    while ((event = walker.next())) {
      type = event.node.type;

      const normalType = type as "typeRender";

      if (this[normalType]) {
        this[normalType](event.node, event.entering);
      }
    }

    return this.buffer;
  };

  /**
   *  Concatenate a string to the buffer possibly escaping the content.
   *
   *  Concrete renderer implementations should override this method.
   *
   *  @param str {String} The string to concatenate.
   */
  readonly out = (str: string) => {
    this.lit(str);
  };

  /**
   *  Concatenate a literal string to the buffer.
   *
   *  @param str {String} The string to concatenate.
   */
  readonly lit = (str: string) => {
    this.buffer += str;
    this.lastOut = str;
  };

  /**
   *  Output a newline to the buffer.
   */
  readonly cr = () => {
    if (this.lastOut !== "\n") {
      this.lit("\n");
    }
  };

  /**
   *  Escape a string for the target renderer.
   *
   *  Abstract function that should be implemented by concrete
   *  renderer implementations.
   *
   *  @param str {String} The string to escape.
   */
  readonly esc = (str: string) => {
    return str;
  };
}

export default Renderer;
