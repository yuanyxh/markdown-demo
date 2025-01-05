import "normalize.css";
import "./styles/global.less";

import "./styles/editor-init.less";

import { createEditorElement } from "./utils";

import {
  Parser,
  HtmlRenderer,
  IncludeSourceSpans,
} from "../commonmark-java-change/commonmark";

import example from "./example.md?raw";

import NodeMap from "./nodemap";

import offsetTools from "./offset";

const nodeMap = new NodeMap();

const editor = createEditorElement();
window.document.getElementById("root")!.appendChild(editor);

const markdownParser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

const htmlRenderer = HtmlRenderer.builder()
  .attributeProviderFactory(nodeMap)
  .setSoftbreak("<br />")
  .build();

editor.innerHTML = htmlRenderer.render(markdownParser.parse(example));

function getOffset(
  this: INodeRange,
  offset: number,
  get: (typeof offsetTools)[number]
) {
  if (offset === -1) {
    return get.call(this, this.node, this.offset, nodeMap);
  }

  return offset;
}

function runOffset(range: StaticRange) {
  const start = offsetTools.reduce(
    getOffset.bind({
      node: range.startContainer,
      offset: range.startOffset,
      source: example,
    }),
    -1
  );

  const end = offsetTools.reduce(
    getOffset.bind({
      node: range.endContainer,
      offset: range.endOffset,
      source: example,
    }),
    -1
  );

  return { start: start, end: end };
}

window.document.addEventListener("selectionchange", () => {
  const selection = window.document.getSelection();

  if (!selection) {
    return false;
  }

  const range = selection.getRangeAt(0);

  console.log(range);

  const changeRange = runOffset(range);

  console.log(changeRange);

  console.log(example.charAt(changeRange.start));
  console.log(example.charAt(changeRange.end));
});
