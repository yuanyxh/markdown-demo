import "normalize.css";
import "./styles/global.less";

import "./styles/editor-init.less";

import { createEditorElement } from "./utils";

import {
  Parser,
  HtmlRenderer,
  IncludeSourceSpans,
} from "commonmark-java/commonmark";

import source from "./example.md?raw";

import NodeMap from "./nodemap";
import { runOffset } from "./offset";

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

editor.innerHTML = htmlRenderer.render(markdownParser.parse(source));

window.document.addEventListener("selectionchange", () => {
  const selection = window.document.getSelection();

  if (!selection) {
    return false;
  }

  const range = selection.getRangeAt(0);

  console.log(range);

  const changeRange = runOffset.call({ source: source, nodeMap }, range);

  console.log(changeRange);
  console.log(source.charAt(changeRange.start));
  console.log(source.charAt(changeRange.end));
});
