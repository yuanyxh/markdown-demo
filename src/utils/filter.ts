const LINE_BREAK_REG = /\n{1,2}/;

export function filterBreakNode(node: Node) {
  if (node instanceof Text && node.nodeValue && LINE_BREAK_REG.test(node.nodeValue)) {
    return false;
  }

  return true;
}
