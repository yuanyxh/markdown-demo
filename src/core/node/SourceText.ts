import type { MarkdownNode, Visitor } from 'commonmark-java-js';

import { CustomNode } from 'commonmark-java-js';

/** Source code node. Use it to control the rendering of other Markdown nodes. */
class SourceText extends CustomNode {
  private literal: string;
  private companionNode: MarkdownNode;

  public constructor(literal: string, companionNode: MarkdownNode) {
    super('source-text');

    this.literal = literal;
    this.companionNode = companionNode;
  }

  accept(visitor: Visitor): void {
    visitor.visit(this);
  }

  public getLiteral(): string {
    return this.literal;
  }

  public setLiteral(literal: string) {
    this.literal = literal;
  }

  public getCompanionNode(): MarkdownNode {
    return this.companionNode;
  }

  public setCompanionNode(companionNode: MarkdownNode): MarkdownNode {
    this.companionNode = companionNode;

    return this;
  }
}

export default SourceText;
