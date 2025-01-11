import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';
import TypeTools from './utils/typetools';

interface ScopeConfig {
  context: Editor;
}

class Scope {
  private context: Editor;

  private innerScopes: MarkdownNode[] = [];

  public constructor(config: ScopeConfig) {
    this.context = config.context;
  }

  public get scopes() {
    return this.innerScopes.slice(0);
  }

  public updateScopes(range: StaticRange): boolean {
    this.innerScopes.length = 0;

    const { from, to } = this.context.locate(range);

    this.findScopeByPoint(this.context.doc, from);

    if (to !== from) {
      this.findScopeByPoint(this.context.doc, to);
    }

    return this.innerScopes.length !== 0;
  }

  private findScopeByPoint(node: MarkdownNode, position: number): boolean {
    const children = node.children;

    let curr: MarkdownNode;
    let next: MarkdownNode;
    let finded = false;

    for (let i = 0; i < children.length; i++) {
      curr = children[i];
      next = children[i + 1];

      if (position >= curr.inputIndex && position <= curr.inputEndIndex) {
        const findedInChildren = this.findScopeByPoint(curr, position);

        if (!findedInChildren) {
          this.innerScopes.push(curr);
        } else if (TypeTools.isTransformNode(curr)) {
          this.innerScopes.push(curr);

          finded = true;
        }
      }
    }

    return finded;
  }
}

export default Scope;
