import "normalize.css";
import "./styles/global.less";

import "./styles/editor-init.less";

import { createEditorElement } from "./utils";

import {
  Parser,
  HtmlRenderer,
  IncludeSourceSpans,
} from "../commonmark-java-change/commonmark";

import type { Block, MarkdownNode } from "../commonmark-java-change/commonmark";

import example from "./example.md?raw";

import NodeMap from "./nodemap";

const nodeMap = new NodeMap();

const editor = createEditorElement();
window.document.getElementById("root")!.appendChild(editor);

editor.addEventListener("beforeinput", (e) => {
  e.preventDefault();

  const range = e.getTargetRanges()[0];

  const changedRange = getMarkdownChangeRange(range);

  console.log(changedRange);

  console.log(example.charAt(changedRange.start));
  console.log(example.charAt(changedRange.end));
});

const markdownParser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

const htmlRenderer = HtmlRenderer.builder()
  .attributeProviderFactory(nodeMap)
  .build();

editor.innerHTML = htmlRenderer.render(markdownParser.parse(example));

function getSourcePosition(node: MarkdownNode) {
  const spans = node.getSourceSpans();
  const inputIndex = spans[0].getInputIndex();
  const inputLength = spans[spans.length - 1].getLength();

  return { inputIndex, inputLength, inputEndIndex: inputIndex + inputLength };
}

function getMarkdownChangeRange(range: StaticRange): IChangeRange {
  const { startContainer, endContainer, startOffset, endOffset, collapsed } =
    range;

  const start = getMarkdownChangeOffset(startContainer, startOffset);
  const end = getMarkdownChangeOffset(endContainer, endOffset);

  return { start, end };
}

function getMarkdownChangeOffset(container: Node, offset: number) {
  if (container instanceof Text) {
    const span = container.parentElement as HTMLSpanElement;

    const textNode = nodeMap.getNodeByElement(span);

    const { inputIndex } = getSourcePosition(textNode!);

    return inputIndex + offset;
  }

  const element = container as HTMLElement;

  const block = nodeMap.getNodeByElement(element) as Block;

  if (offset === 0) {
    return block.getContentIndex();
  }

  let childMarkdownNode = block.getFirstChild();

  while (--offset > 1) {
    childMarkdownNode = childMarkdownNode!.getNext();
  }

  const { inputEndIndex } = getSourcePosition(childMarkdownNode!);

  return inputEndIndex;
}
