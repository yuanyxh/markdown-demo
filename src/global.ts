import type { MarkdownNode } from 'commonmark-java-js';

declare global {
  interface Node {
    $virtNode: MarkdownNode;
  }
}
