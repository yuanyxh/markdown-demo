import type { MarkdownNode } from 'commonmark-java-js';

/** Extension of {@link MarkdownNode}. For the purpose of extending its type definition. */
export declare abstract class ExtendsMarkdownNode extends MarkdownNode {
  get meta(): { $dom: Node; key: string; synced: boolean };
  get children(): ExtendsMarkdownNode[];

  getNext(): ExtendsMarkdownNode | null;
  getPrevious(): ExtendsMarkdownNode | null;
}
