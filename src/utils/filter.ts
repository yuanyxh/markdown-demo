export function filterBreakNode(node: Node) {
  if (node instanceof Text && node.nodeValue === '\n') {
    return false;
  }

  return true;
}
