import { ExtendsMarkdownNode } from '@/types';

declare global {
  interface Node {
    $virtNode: ExtendsMarkdownNode;
  }
}
