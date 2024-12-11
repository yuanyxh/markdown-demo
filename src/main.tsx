import "normalize.css";
import "./styles/global.less";

import "./styles/editor-init.less";

import { createEditorElement } from "./utils";

import {
  Document,
  Paragraph,
  Parser,
  HtmlRenderer,
  MarkdownRenderer,
  IncludeSourceSpans,
  SourceSpan,
  Block,
} from "../commonmark-java-change/commonmark";

import type { MarkdownNode } from "../commonmark-java-change/commonmark";

import NodeMap from "./nodemap";

// import example from "./example.md?raw";

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

/** 节点映射器 */
const nodeMap = new NodeMap();

/** markdown 解析器 */
const markdownParser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();
/** html 渲染器 */
const htmlRenderer = HtmlRenderer.builder()
  .attributeProviderFactory(nodeMap)
  .setEscapeHtml(true)
  .build();
/** markdown 渲染器 */
const markdownRenderer = MarkdownRenderer.builder().build();

// 当前选区范围
let rangeInDocument: Range | null = null;
let documentSource = "";

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

  const document = new Document();
  const paragraph = new Paragraph();

  paragraph.addSourceSpan(SourceSpan.of(0, 0, 0, 0));

  document.appendChild(paragraph);

  editorElement.innerHTML = htmlRenderer.render(document);

  if (resetCursor) {
    const range = window.document.createRange();
    range.setStart(editorElement.firstElementChild!, 0);
    range.setEnd(editorElement.firstElementChild!, 0);
    range.collapse(true);

    getSelection()?.addRange(range);
  }
}

function init() {
  resetEditor();
}
init();

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
  }
}

// 处理除 composition 外的所有输入事件
function onBeforeInput(e: InputEvent) {
  if (e.isComposing) {
    return false;
  }

  const range = e.getTargetRanges()[0];
  const data = e.data;

  const changeRange = getMarkdownChangeRange(range);
  const commonAncestor = getCommonBlockAncestor(range);

  e.preventDefault();
  console.log(changeRange);

  console.log(range);

  if (commonAncestor === null) {
    return false;
  }

  // e.preventDefault();

  // const { element, blockAncestor } = commonAncestor;

  // documentSource =
  //   documentSource.slice(0, startChangeOffset) +
  //   data +
  //   documentSource.slice(endChangeOffset);

  // console.log(range);

  // console.log(changeRange);
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

// ----------------------------

function getSourcePosition(node?: MarkdownNode) {
  if (!node) {
    throw new Error("Must be have a node param");
  }

  const spans = node.getSourceSpans();
  const inputIndex = spans[0].getInputIndex();
  const inputLength = spans[spans.length - 1].getLength();

  return { inputIndex, inputLength, inputEndIndex: inputIndex + inputLength };
}

/** 获取此次输入 markdown 改变的源码范围 */
function getMarkdownChangeOffset(
  container: Node,
  offset: number,
  isEnd = false
) {
  // 如果 container 为文本，找到父元素 (文本节点无法添加 attribute)
  if (container instanceof Text) {
    const span = container.parentElement as HTMLElement;

    // 找到父元素对应的 MarkdownNode
    const textNode = nodeMap.getNodeByElement(span);

    // 获取源码偏移
    const { inputIndex: markdownOffset } = getSourcePosition(textNode);

    // 源码偏移 + range.[start|end]Offset 等于改变位置的源码偏移
    return markdownOffset + offset;
  }

  // 如果 container 不为文本，默认为 HTML 元素
  const element = container as HTMLElement;

  // 找到元素对应的 MarkdownNode
  const markdownNode = nodeMap.getNodeByElement(element);

  // 如果 offset 为 0，默认取 container 的源码偏移
  if (offset === 0) {
    const { inputIndex } = getSourcePosition(markdownNode);

    // 如果是 endContainer，需要加上 endContainer 元素的源码长度，表示完全选中此元素
    if (isEnd) {
      const { inputIndex } = getSourcePosition(markdownNode);

      // 返回源码偏移加表示此节点的源码长度
      return inputIndex + inputIndex;
    }

    // 返回源码偏移
    return inputIndex;
  }

  // 如果 offset 不为 0，取对应位置的 MarkdownNode 的源码偏移
  let childMarkdownNode = markdownNode?.getFirstChild();

  while (--offset > 1) {
    childMarkdownNode = childMarkdownNode?.getNext();
  }

  const { inputIndex, inputLength } = getSourcePosition(
    childMarkdownNode || void 0
  );

  // endContainer 加上此节点的源码长度
  if (isEnd) {
    return inputIndex + inputLength;
  }

  // 返回源码偏移
  return inputIndex;
}

/** 获取此次输入 markdown 变化的源码范围 */
function getMarkdownChangeRange(range: StaticRange) {
  const { startContainer, endContainer, startOffset, endOffset } = range;

  // 获取开始的源码偏移
  const startChangeOffset = getMarkdownChangeOffset(
    startContainer,
    startOffset
  );
  // 获取结束的源码偏移
  const endChangeOffset = getMarkdownChangeOffset(
    endContainer,
    endOffset,
    true
  );

  return { startChangeOffset, endChangeOffset };
}

function getCommonBlockAncestor(range: StaticRange) {
  const { startContainer, endContainer } = range;

  if (startContainer === endContainer) {
    let element = startContainer;

    if (!(element instanceof HTMLElement)) {
      element = element.parentElement!;
    }

    const block = getBlock(element as HTMLElement);

    if (block) {
      return { element: element as HTMLElement, blockAncestor: block };
    }
  }

  let node = startContainer;
  while (node) {
    if (node instanceof HTMLElement && node.contains(endContainer)) {
      const block = getBlock(node);

      if (block) {
        return { element: node, blockAncestor: block };
      }
    }

    node = node.parentElement!;
  }

  return null;
}

function getBlock(element: HTMLElement) {
  const block = nodeMap.getNodeByElement(element);

  return block instanceof Block ? block : null;
}
