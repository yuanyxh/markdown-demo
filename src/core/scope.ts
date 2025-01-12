import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';

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

    const { from, to } = this.context.locateSrcPos(range);

    console.log(from, to, this.context.source.charAt(from), this.context.source.charAt(to));

    this.findScopeByPoint(this.context.doc, from);

    if (to !== from) {
      this.findScopeByPoint(this.context.doc, to);
    }

    return this.innerScopes.length !== 0;
  }

  private push(node: MarkdownNode) {
    if (!this.innerScopes.includes(node)) {
      this.innerScopes.push(node);
    }
  }

  private findScopeByPoint(node: MarkdownNode, position: number): boolean {
    const children = node.children;

    let curr: MarkdownNode;
    let next: MarkdownNode;
    let finded = false;

    for (let i = 0; i < children.length; i++) {
      curr = children[i];
      next = children[i + 1];

      if (next && position > curr.inputEndIndex && position < next.inputIndex) {
        this.push(curr);

        return true;
      }

      if (position >= curr.inputIndex && position <= curr.inputEndIndex) {
        const findedInChildren = this.findScopeByPoint(curr, position);

        if (!findedInChildren) {
          this.push(curr);

          finded = true;
        } else {
          this.push(curr);

          finded = true;
        }
      }
    }

    return finded;
  }
}

export default Scope;
