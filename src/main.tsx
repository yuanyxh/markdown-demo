import "normalize.css";
import "./styles/global.less";

import {
  Parser,
  IncludeSourceSpans,
  HtmlRenderer,
} from "./packages/commonmark";

import { readFileAsText } from "./utils";

import { MarkdownTools } from "./tools";
import { NodeMapAttributeProviderFactory } from "./attribute-provider";

import type { MarkdownNode } from "./packages/commonmark";

const parser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

const nodeMapAttributeProviderFactory = new NodeMapAttributeProviderFactory();

const markdownTools = new MarkdownTools(nodeMapAttributeProviderFactory);

const htmlRenderer = HtmlRenderer.builder()
  .attributeProviderFactory(nodeMapAttributeProviderFactory)
  .build();

let markdownText = "";
let markdownDocument!: MarkdownNode;

function renderToHTML(markdown: string) {
  markdownText = markdown;
  markdownDocument = parser.parse(markdown);

  const html = htmlRenderer.render(markdownDocument);

  editor.innerHTML = html;
}

function processRange(range: StaticRange, type: string, data: string) {
  const { startChangeOffset, endChangeOffset } =
    markdownTools.getMarkdownChangeRange(range);

  renderToHTML(
    markdownTools.getUpdatedMarkdown(
      markdownText,
      startChangeOffset,
      endChangeOffset,
      type,
      data
    )
  );

  const { newStartContainer, newStartOffset, newEndContainer, newEndOffset } =
    markdownTools.getElementSelectionRange(
      markdownDocument,
      type === "deleteContentBackward" ? endChangeOffset : startChangeOffset,
      endChangeOffset
    );

  const newRange = window.document.createRange();

  if (
    newStartContainer === newEndContainer &&
    newStartOffset === newEndOffset
  ) {
    if (type === "insertText") {
      newRange.setStart(newStartContainer, newStartOffset + 1);
      newRange.setEnd(newEndContainer, newEndOffset + 1);
    } else if (type === "deleteContentBackward") {
      newRange.setStart(newStartContainer, newStartOffset - 1);
      newRange.setEnd(newEndContainer, newEndOffset - 1);
    }

    newRange.collapse(true);
  } else {
    console.log(newStartOffset, newEndOffset);

    newRange.setStart(newStartContainer, newStartOffset);
    newRange.setEnd(newEndContainer, newEndOffset);
  }

  const selection = window.document.getSelection();

  if (selection && window.document.activeElement === editor) {
    selection.addRange(newRange);
  }
}

function onBeforeInput(e: InputEvent) {
  e.preventDefault();

  console.log(e.inputType);

  const [range] = e.getTargetRanges();

  if (window.document.activeElement === editor) {
    const selection = window.document.getSelection();
    selection?.removeAllRanges();

    processRange(range, e.inputType, e.data || "");
  }
}

const editor = window.document.getElementById("editor")!;
const fileSelect = window.document.getElementById(
  "fileSelect"
)! as HTMLInputElement;
const fileTrigger = window.document.getElementById("fileTrigger")!;

fileTrigger.addEventListener("click", () => {
  fileSelect.click();
});

fileSelect.addEventListener("change", () => {
  if (!fileSelect.files) {
    return false;
  }

  const file = fileSelect.files[0];

  if (!file) {
    return false;
  }

  readFileAsText(file).then((text) => {
    renderToHTML(text);
  });

  fileSelect.value = "";
});

editor.addEventListener("beforeinput", onBeforeInput);
