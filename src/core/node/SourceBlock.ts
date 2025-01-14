import type { MarkdownNode, Visitor } from 'commonmark-java-js';

import type { LiteralNode } from '@/types';

import { CustomBlock } from 'commonmark-java-js';

/** Block-level source code node. Use it to control the rendering of other Markdown block nodes. */
class SourceBlock extends CustomBlock implements LiteralNode {
  private literal: string;
  private companionNode: MarkdownNode;

  public constructor(literal: string, companionNode: MarkdownNode) {
    super('source-block');

    this.literal = literal;
    this.companionNode = companionNode;
  }

  accept(visitor: Visitor): void {
    visitor.visit(this);
  }

  public getLiteral(): string {
    return this.literal;
  }

  public setLiteral(literal: string): void {
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

export default SourceBlock;
