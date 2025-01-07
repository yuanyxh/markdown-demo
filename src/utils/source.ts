import type { MarkdownNode, Block } from "commonmark-java-js";

export function getSourcePosition(node: MarkdownNode) {
  const spans = node.getSourceSpans();

  const inputIndex = spans[0].getInputIndex();

  const lastSpan = spans[spans.length - 1];
  const inputEndLength = lastSpan.getInputIndex() + lastSpan.getLength();
  const inputLength = inputEndLength - inputIndex;

  return { inputIndex, inputLength, inputEndIndex: inputEndLength };
}

export function getContentIndex(block: Block) {
  const child = block.getFirstChild();

  if (child === null) {
    const sources = block.getSourceSpans();
    const source = sources[0];

    if (source) {
      return source.getInputIndex() + source.getLength();
    }

    return -1;
  }

  const childSources = child.getSourceSpans();
  const source = childSources[0];

  if (source) {
    return source.getInputIndex();
  }

  return -1;
}
