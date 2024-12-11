import "normalize.css";
import "./styles/global.less";

import "./styles/editor-init.less";

import { createEditorElement } from "./utils";

import {
  Paragraph,
  HtmlRenderer,
  MarkdownRenderer,
} from "../commonmark-java-change/commonmark";

// 创建一个 Editor 实例
const editorElement = createEditorElement();
window.document.getElementById("root")!.appendChild(editorElement);

// 侦听 beforeinput 事件，处理除 composition 外的所有输入类型
editorElement.addEventListener("beforeinput", onBeforeInput);

// 侦听 input 事件
editorElement.addEventListener("input", onInput);
// 处理 composition 输入事件
editorElement.addEventListener("compositionend", onCompositionEnd);
// 处理选区变化事件
window.document.addEventListener("selectionchange", onSelectionChange);

/** html 渲染器 */
const htmlRenderer = HtmlRenderer.builder().build();
const markdownRenderer = MarkdownRenderer.builder().build();

// 当前选区范围
let rangeInDocument: Range | null = null;

/**
 * 获取文档选区
 *
 * @returns
 */
function getSelection() {
  return window.document.getSelection();
}

/**
 * 重置编辑器与光标
 */
function resetEditor() {
  let resetCursor = false;
  if (window.document.activeElement === editorElement) {
    resetCursor = true;
  }

  const paragraph = new Paragraph();
  editorElement.innerHTML = htmlRenderer.render(paragraph);

  if (resetCursor) {
    const range = window.document.createRange();
    range.setStart(editorElement.firstElementChild!, 0);
    range.setEnd(editorElement.firstElementChild!, 0);
    range.collapse(true);

    getSelection()?.addRange(range);
  }
}

resetEditor();

// 处理编辑器选区变化事件，获取当前编辑的作用域范围
function onSelectionChange() {
  if (window.document.activeElement !== editorElement) {
    return false;
  }

  const selection = window.document.getSelection();

  if (selection && selection.rangeCount) {
    rangeInDocument = selection.getRangeAt(selection.rangeCount - 1);

    // 保证只有一个选区范围
    if (selection.rangeCount > 1) {
      for (let i = selection.rangeCount - 2; i >= 0; i--) {
        selection.removeRange(selection.getRangeAt(i));
      }
    }

    // console.log(rangeInDocument);
  }
}

// 处理除 composition 外的所有输入事件
function onBeforeInput(e: InputEvent) {
  if (e.isComposing) {
    return false;
  }
}

/**
 * 处理 input 事件
 *
 * @param e
 * @returns
 */
function onInput(e: Event) {
  // 当编辑器为空时，添加一个空段落
  if (isEmptyEditor()) {
    return resetEditor();
  }

  if (rangeInDocument) {
    const block = getBlockParentUp(rangeInDocument.startContainer);

    if (block === null) {
      return false;
    }

    e.preventDefault();

    if (!isParagraph(block)) {
      return false;
    }
  }
}

// 处理 composition 输入事件
function onCompositionEnd(e: CompositionEvent) {
  if (!e.data) {
    return false;
  }
}

/**
 * 编辑器内容是否为空
 *
 * @returns
 */
function isEmptyEditor() {
  return (
    editorElement.childNodes.length === 0 ||
    (editorElement.childNodes.length === 1 &&
      editorElement.firstElementChild?.tagName.toLocaleLowerCase() === "br")
  );
}

/**
 * 获取祖先块
 *
 * @param node
 * @returns
 */
function getBlockParentUp(node: Node) {
  while (node) {
    if (node === editorElement) {
      return null;
    }

    if (isBlock(node)) {
      return node;
    }

    if (node.parentElement) {
      node = node.parentElement;
    } else {
      return null;
    }
  }

  return node;
}

const CONTAINER_BLOCK_LIST = [
  "p",
  "li",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
];
/**
 * 是否是块节点
 *
 * @param node
 * @returns
 */
function isBlock(node: Node): node is HTMLElement {
  if (
    node instanceof HTMLElement &&
    CONTAINER_BLOCK_LIST.includes(node.tagName.toLocaleLowerCase())
  ) {
    return true;
  }

  return false;
}

/**
 * 是否是段落
 *
 * @param element
 * @returns
 */
function isParagraph(element: HTMLElement) {
  return element.tagName.toLocaleLowerCase() === "p";
}
