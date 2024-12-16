import "normalize.css";
import "./styles/global.less";

import "./styles/editor-init.less";

import { createEditorElement } from "./utils";

import {
  Document,
  Paragraph,
  Parser,
  HtmlRenderer,
  IncludeSourceSpans,
  SourceSpan,
  Block,
} from "../commonmark-java-change/commonmark";

import type { MarkdownNode } from "../commonmark-java-change/commonmark";

import NodeMap from "./nodemap";

const editorElement = createEditorElement();
window.document.getElementById("root")!.appendChild(editorElement);

editorElement.addEventListener("beforeinput", onBeforeInput);

editorElement.addEventListener("input", onInput);

editorElement.addEventListener("compositionend", onCompositionEnd);

window.document.addEventListener("selectionchange", onSelectionChange);

const nodeMap = new NodeMap();

const markdownParser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

const htmlRenderer = HtmlRenderer.builder()
  .attributeProviderFactory(nodeMap)
  .build();

let changeRange: IChangeRange;
let event: InputEvent;
let documentSource = "";
let documentNode: MarkdownNode;
let previousDocumentNode: MarkdownNode;
let inputData: string | File[] = "";
let isEmpty = false;
let cursorDir: TCursorDir = "forward";
let cursor = 0;

(function initEditor() {
  resetEditor();
})();

function onSelectionChange() {
  if (window.document.activeElement !== editorElement) {
    return false;
  }

  const selection = getSelection();

  if (selection && selection.rangeCount) {
    const range = selection.getRangeAt(selection.rangeCount - 1);

    if (selection.rangeCount > 1) {
      for (let i = selection.rangeCount - 2; i >= 0; i--) {
        selection.removeRange(selection.getRangeAt(i));
      }
    }
  }
}

function onBeforeInput(e: InputEvent) {
  event = e;

  if (e.isComposing) {
    return false;
  }

  const range = e.getTargetRanges()[0];

  setInputData();
  setCursorDir();

  setChangeRange(range);
  setCursor(getPlainSource());

  console.log(documentSource, changeRange);

  setDocument();

  console.log("newdocument--::", documentSource);

  if (!documentSource) {
    isEmpty = true;
  }
}

function onInput(event: Event) {
  const e = event as InputEvent;

  if (e.isComposing) {
    return false;
  }

  if (isEmpty) {
    return resetEditor();
  }

  const changedNodes = compareTrees(documentNode, previousDocumentNode);
  nodeMap.replaceTree(documentNode, previousDocumentNode);

  if (!changedNodes) {
    return false;
  }

  patch(changedNodes);
}

function onCompositionEnd(e: CompositionEvent) {
  if (!e.data) {
    return false;
  }
}

function resetEditor() {
  const paragraph = new Paragraph();
  paragraph.addSourceSpan(SourceSpan.of(0, 0, 0, 0));

  previousDocumentNode = documentNode;

  documentNode = new Document();
  documentNode.appendChild(paragraph);

  nodeMap.replaceTree(documentNode, previousDocumentNode);

  editorElement.innerHTML = htmlRenderer.render(documentNode);

  if (window.document.activeElement === editorElement) {
    const range = window.document.createRange();
    range.setStart(editorElement.firstElementChild!, 0);
    range.collapse(true);

    getSelection()?.addRange(range);
  }

  isEmpty = false;
}

function compareTrees(
  newNode: MarkdownNode | null,
  oldNode: MarkdownNode | null
): INodeHolder[] | false {
  const changedNodes: INodeHolder[] = [];

  let childChangedNodes: INodeHolder[] | false;

  let nChildren = newNode?.getChildren() || [];
  let oChildren = oldNode?.getChildren() || [];

  let prevOldNode: MarkdownNode | null = null;

  for (let i = 0; i < nChildren.length; i++) {
    const currN = nChildren[i];
    const currO = oChildren[i];

    // 插入新的节点
    if (currN && !currO) {
      // 如果是内联节点需要重渲染父节点
      if (isInlineNode(currN) || isInlineNode(currO)) {
        changedNodes.push({
          type: "replace",
          target: oldNode ? getElement(oldNode) : null,
          node: newNode,
        });

        // 在上一个节点后插入
      } else if (prevOldNode) {
        changedNodes.push({
          type: "insertAfter",
          target: getElement(prevOldNode),
          node: currN,
        });

        // 父级插入第一个子节点
      } else {
        changedNodes.push({
          type: "insertFirstChild",
          target: oldNode ? getElement(oldNode) : null,
          node: currN,
        });
      }

      // 节点类型被更改
    } else if (currN.type !== currO.type) {
      // 如果是内联节点需要重渲染父节点
      if (isInlineNode(currN) || isInlineNode(currO)) {
        changedNodes.push({
          type: "replace",
          target: oldNode ? getElement(oldNode) : null,
          node: newNode,
        });
      } else {
        changedNodes.push({
          type: "replace",
          target: getElement(currO),
          node: currN,
        });
      }

      // 后辈节点有更改
    } else if ((childChangedNodes = compareTrees(currN, currO))) {
      changedNodes.push(...childChangedNodes);
    }

    prevOldNode = currO;
  }

  // 新节点中不存在的节点，需要被删除
  for (let i = nChildren.length; i < oChildren.length; i++) {
    const oNode = oChildren[i];

    if (isInlineNode(oNode)) {
      changedNodes.push({
        type: "replace",
        target: oldNode ? getElement(oldNode) : null,
        node: newNode,
      });
    } else {
      changedNodes.push({
        type: "remove",
        target: getElement(oNode),
        node: null,
      });
    }
  }

  if (changedNodes.length) {
    return changedNodes;
  }

  return false;
}

function patch(changedNodes: INodeHolder[]) {
  for (let i = 0; i < changedNodes.length; i++) {
    const { type, node, target } = changedNodes[i];

    if (target === null) {
      continue;
    }

    const getHtml = () => (node ? htmlRenderer.render(node) : "");

    switch (type) {
      case "insertFirstChild":
        if (target.firstElementChild) {
          target.firstElementChild.outerHTML = getHtml();
        } else {
          target.innerHTML = getHtml();
        }

        break;
      case "insertAfter":
        target.insertAdjacentHTML("afterend", getHtml());

        break;
      case "remove":
        target.remove();

        break;
      case "replace":
        if (target.parentNode !== null) {
          target.outerHTML = getHtml();
        }

        break;
    }
  }
}

function setChangeRange(range: StaticRange) {
  changeRange = getMarkdownChangeRange(range);
}

/**
 * 设置新的源码
 */
function setDocument() {
  documentSource =
    documentSource.slice(0, changeRange.start) +
    inputData +
    documentSource.slice(changeRange.end);

  previousDocumentNode = documentNode;
  documentNode = markdownParser.parse(documentSource);
}

/**
 * 设置输入数据
 *
 * @param e
 * @returns
 */
function setInputData() {
  if (event.dataTransfer) {
    if (event.dataTransfer.files.length) {
      const originFiles = Array.from(event.dataTransfer.files);

      const files = originFiles.filter((file) => isImageFile(file));

      if (files.length) {
        return (inputData = files);
      }
    }

    const plainText = getTextFromTransfer(event.dataTransfer);

    if (plainText) {
      return (inputData = plainText);
    }
  }

  if (event.data) {
    return (inputData = event.data);
  }

  switch (event.inputType) {
    case "insertParagraph":
      inputData = "\n\n";

      break;

    case "insertUnorderedList":
      inputData = "\n- ";

      break;

    case "insertOrderedList":
      inputData = "1. ";
      break;
    default:
      inputData = "";
      break;
  }
}

function setCursorDir() {
  switch (event.inputType) {
    // insert
    case "insertText":
    case "insertReplacementText":
    case "insertLineBreak":
    case "insertParagraph":
    case "insertOrderedList":
    case "insertUnorderedList":
    case "insertFromYank":
    case "insertFromDrop":
    case "insertFromPaste":
    case "insertTranspose":
    case "insertLink":

    // delete
    case "deleteWordForward":
    case "deleteContentForward":
    case "deleteSoftLineForward":
      cursorDir = "forward";
      break;

    case "deleteWordBackward":
    case "deleteByDrag":
    case "deleteByCut":
    case "deleteContentBackward":
    case "deleteSoftLineBackward":
    case "deleteEntireSoftLine":
      cursorDir = "backword";
      break;
    default:
      cursorDir = "forward";
      break;
  }
}

function setCursor(data = "") {
  switch (event.inputType) {
    // insert
    case "insertText":
    case "insertReplacementText":
    case "insertLineBreak":
    case "insertParagraph":
    case "insertOrderedList":
    case "insertUnorderedList":
    case "insertFromYank":
    case "insertFromDrop":
    case "insertFromPaste":
    case "insertTranspose":
    case "insertLink":
      cursor = changeRange.start + data.length;

      break;

    // delete forward
    case "deleteWordForward":
    case "deleteContentForward":
    case "deleteSoftLineForward":
      cursor = changeRange.end;

      break;

    // delete backward
    case "deleteWordBackward":
    case "deleteByDrag":
    case "deleteByCut":
    case "deleteContentBackward":
    case "deleteSoftLineBackward":
    case "deleteEntireSoftLine":
      cursor = changeRange.start;

      break;
    default:
      cursor = changeRange.start;

      break;
  }
}

function getSelection() {
  return window.document.getSelection();
}

function getPlainSource() {
  if (typeof inputData === "string") {
    return inputData;
  }

  return "";
}

function getTextFromTransfer(dataTransfer: DataTransfer) {
  let text = dataTransfer.getData("text/plain");

  if (!text) {
    return dataTransfer.getData("text/html");
  }

  return text;
}

function getSourcePosition(node?: MarkdownNode | null) {
  if (!node) {
    throw new Error("Must be have a node param");
  }

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

// FIXME:
function getMarkdownChangeOffset(container: Node, offset: number) {
  if (container instanceof Text) {
    const span = container.parentElement as HTMLSpanElement;

    const textNode = nodeMap.getNodeByElement(span);

    const { inputIndex } = getSourcePosition(textNode);

    return inputIndex + offset;
  }

  const element = container as HTMLElement;

  const markdownNode = nodeMap.getNodeByElement(element);

  if (offset === 0) {
    let index: number;

    if (cursorDir === "forward") {
      index = getSourcePosition(markdownNode).inputEndIndex;
    } else {
      index = getSourcePosition(markdownNode).inputIndex;
    }

    return index;
  }

  let childMarkdownNode = markdownNode?.getFirstChild();

  while (--offset > 1) {
    childMarkdownNode = childMarkdownNode?.getNext();
  }

  const { inputEndIndex } = getSourcePosition(childMarkdownNode);

  return inputEndIndex;
}

function getElement(node: MarkdownNode) {
  const nodeId = nodeMap.getNodeIdByMap(node);

  if (nodeId) {
    return getElementByNodeId(nodeId);
  }

  return null;
}

function getElementByNodeId(nodeId: string | null) {
  return editorElement.querySelector(
    '[data-cid="' + nodeId + '"]'
  ) as HTMLElement;
}

/**
 * 是否是图片文件
 *
 * @param file
 * @returns
 */
function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

/**
 * 是内联节点
 *
 * @param node
 * @returns
 */
function isInlineNode(node: MarkdownNode) {
  return !(node instanceof Block);
}

// #endregion
