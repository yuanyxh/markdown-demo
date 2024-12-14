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
  Text as MarkdownText,
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
  .build();

/** 变更范围 */
let changeRange: IChangeRange;
/** 输入事件对象 */
let event: InputEvent;
/** 文档源码 */
let documentSource = "";
/** 文档节点 */
let documentNode: MarkdownNode;
/** 旧文档节点 */
let previousDocumentNode: MarkdownNode;
/** 输入数据 */
let inputData: string | File[] = "";
/** 光标方向 */
let cursorDir: TCursorDir = "forward";
/** 光标在源码中的位置 */
let cursor = 0;

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

  documentNode = new Document();
  const paragraph = new Paragraph();
  const text = new MarkdownText("");

  documentNode.appendChild(paragraph);

  paragraph.addSourceSpan(SourceSpan.of(0, 0, 0, 0));
  text.addSourceSpan(SourceSpan.of(0, 0, 0, 0));

  editorElement.innerHTML = htmlRenderer.render(documentNode);

  if (resetCursor) {
    const range = window.document.createRange();
    range.setStart(editorElement.firstElementChild!, 0);
    range.collapse(true);

    getSelection()?.addRange(range);
  }
}

/**
 * 初始化
 */
function init() {
  resetEditor();
}
init();

// 处理编辑器选区变化事件，获取当前编辑的作用域范围
function onSelectionChange() {
  if (window.document.activeElement !== editorElement) {
    return false;
  }

  const selection = getSelection();

  if (selection && selection.rangeCount) {
    selection.getRangeAt(selection.rangeCount - 1);

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

  changeRange = getMarkdownChangeRange(range);

  setInputData(e);
  setCursorDir(e);
  setCursor(e, changeRange, getPlainSource());
  setDocument();

  event = e;
}

/**
 * 处理 input 事件
 *
 * @param e
 * @returns
 */
function onInput(event: Event) {
  const e = event as InputEvent;

  if (e.isComposing) {
    return false;
  }

  // 当编辑器为空时，添加一个空段落
  if (isEmptyEditor()) {
    return resetEditor();
  }

  const changedNodes = compareTrees(documentNode, previousDocumentNode);

  if (!changedNodes) {
    return false;
  }

  patch(changedNodes);
}

// 处理 composition 输入事件
function onCompositionEnd(e: CompositionEvent) {
  if (!e.data) {
    return false;
  }
}

function patch(changedNodes: INodeHolder[]) {
  for (let i = 0; i < changedNodes.length; i++) {
    const { node, element } = changedNodes[i];

    console.log(element, node);
  }
}

function getElementByNodeId(nodeId: string | null) {
  return editorElement.querySelector(
    '[data-cid="' + nodeId + '"]'
  ) as HTMLElement;
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
 * 获取源码位置
 *
 * @param node
 * @returns
 */
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
function getMarkdownChangeRange(range: StaticRange): IChangeRange {
  const { startContainer, endContainer, startOffset, endOffset } = range;

  // 获取开始的源码偏移
  const start = getMarkdownChangeOffset(startContainer, startOffset);
  // 获取结束的源码偏移
  const end = getMarkdownChangeOffset(endContainer, endOffset, true);

  return { start, end };
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
function setInputData(e: InputEvent) {
  if (e.dataTransfer) {
    if (e.dataTransfer.files.length) {
      const originFiles = Array.from(e.dataTransfer.files);

      const files = originFiles.filter((file) => isImageFile(file));

      if (files.length) {
        return (inputData = files);
      }
    }

    const plainText = getTextFromTransfer(e.dataTransfer);

    if (plainText) {
      return (inputData = plainText);
    }
  }

  if (e.data) {
    return (inputData = e.data);
  }

  switch (e.inputType) {
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
 * 获取文本
 *
 * @param dataTransfer
 * @returns
 */
function getTextFromTransfer(dataTransfer: DataTransfer) {
  let text = dataTransfer.getData("text/plain");

  if (!text) {
    return dataTransfer.getData("text/html");
  }

  return text;
}

/**
 * 设置光标向前或向后（取开始还是结束）
 *
 * @param e
 */
function setCursorDir(e: InputEvent) {
  switch (e.inputType) {
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

/**
 * 设置光标在源码中的位置
 *
 * @param e
 * @param changeRange
 * @param data
 */
function setCursor(e: InputEvent, changeRange: IChangeRange, data = "") {
  switch (e.inputType) {
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

/**
 * 插入文本
 *
 * @returns
 */
function isInsert() {
  let isInsert = false;

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
      isInsert = true;

      break;

    default:
      break;
  }

  return isInsert;
}

/**
 * 删除文本
 *
 * @returns
 */
function isDelete() {
  let isDelete = false;

  switch (event.inputType) {
    // delete
    case "deleteWordForward":
    case "deleteContentForward":
    case "deleteSoftLineForward":
    case "deleteWordBackward":
    case "deleteByDrag":
    case "deleteByCut":
    case "deleteContentBackward":
    case "deleteSoftLineBackward":
    case "deleteEntireSoftLine":
      isDelete = true;

      break;
    default:
      break;
  }

  return isDelete;
}

/**
 * 获取纯源码文本
 *
 * @returns
 */
function getPlainSource() {
  if (typeof inputData === "string") {
    return inputData;
  }

  return "";
}

function compareTrees(
  newNode: MarkdownNode | null,
  oldNode: MarkdownNode | null
): INodeHolder[] | false {
  const changedNodes: INodeHolder[] = [];

  let childChangedNodes: INodeHolder[] | false;

  let n = newNode?.getFirstChild();
  let o = oldNode?.getFirstChild();

  while (n) {
    if (n.type !== o?.type) {
      changedNodes.push({
        element: getElementByNodeId(nodeMap.getNodeIdByMap(o)),
        node: n,
      });
    } else {
      if (
        (childChangedNodes = compareTrees(n.getFirstChild(), o.getFirstChild()))
      ) {
        changedNodes.push(...childChangedNodes);
      }
    }

    n = n.getNext();
    o = o?.getNext();
  }

  if (changedNodes.length) {
    return changedNodes;
  }

  // remvoe o exis but n delete

  return false;
}

/**
 * 计算编辑器光标
 *
 * @param block
 * @param sourceOffset
 */
function editorCursorCalculator(block: Block, sourceOffset: number) {}
