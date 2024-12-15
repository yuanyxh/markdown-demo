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

import example from "./example.md?raw";

// 创建一个 Editor 实例
const editorElement = createEditorElement();
window.document.getElementById("root")!.appendChild(editorElement);

// 侦听 beforeinput 事件，处理除 composition 外的所有输入类型
editorElement.addEventListener("beforeinput", onBeforeInput);

// 侦听 input 事件
// editorElement.addEventListener("input", onInput);

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

editorElement.innerHTML = htmlRenderer.render(markdownParser.parse(example));

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

// (function initEditor() {
//   resetEditor();
// })();

// ---------------------
// =====================

// #region event

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
  event = e;

  if (e.isComposing) {
    return false;
  }

  const range = e.getTargetRanges()[0];
  const { startContainer, endContainer } = range;

  if (
    startContainer instanceof HTMLElement ||
    endContainer instanceof HTMLElement
  ) {
    e.preventDefault();
    console.log(range);
  }

  // const range = e.getTargetRanges()[0];

  // setInputData(event);
  // setChangeRange(range);
  // setCursor(event, changeRange, getPlainSource());
  // setCursorDir(event);
  // setDocument();

  // if (documentSource === "") {
  //   resetEditor();
  // }
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

  console.log("cursor", editorCursorCalculator(documentNode));
}

// 处理 composition 输入事件
function onCompositionEnd(e: CompositionEvent) {
  if (!e.data) {
    return false;
  }
}

// #endregion

// ---------------------
// =====================

// #region editor & node tools

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

  documentNode.appendChild(paragraph);

  paragraph.addSourceSpan(SourceSpan.of(0, 0, 0, 0));

  editorElement.innerHTML = htmlRenderer.render(documentNode);

  if (resetCursor) {
    const range = window.document.createRange();
    range.setStart(editorElement.firstElementChild!, 0);
    range.collapse(true);

    getSelection()?.addRange(range);
  }
}

/**
 * diff node tree
 *
 * @param newNode
 * @param oldNode
 * @returns
 */
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

        if (newNode && oldNode) {
          nodeMap.replaceNode(newNode, oldNode);
        }

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

        if (newNode && oldNode) {
          nodeMap.replaceNode(newNode, oldNode);
        }
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

      // 无更改，使用新节点继承节点
    } else {
      nodeMap.replaceNode(currN, currO);
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

      if (newNode && oldNode) {
        nodeMap.replaceNode(newNode, oldNode);
      }
    } else {
      changedNodes.push({
        type: "remove",
        target: getElement(oNode),
        node: null,
      });
    }

    // 删除不再需要的节点
    nodeMap.deleteNode(oNode);
  }

  if (changedNodes.length) {
    return changedNodes;
  }

  return false;
}

/**
 * 打补丁
 *
 * @param changedNodes
 */
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
        target.outerHTML = getHtml();

        break;
    }
  }
}

/**
 * 计算编辑器光标
 *
 * @param block
 */
function editorCursorCalculator(node: MarkdownNode): MarkdownNode | null {
  // 获取父节点的第一个子节点
  let curr = node.getFirstChild();

  // 迭代子节点
  while (curr) {
    // 获取当前节点的源码偏移与节点的源码长度
    const { inputIndex: offset, inputLength: length } = getSourcePosition(curr);
    // 获取到节点在源码中的结束位置
    const endOffset = offset + length;

    const child = curr.getFirstChild();

    // 如果位置在当前节点内
    if (cursor >= offset && cursor <= endOffset) {
      // 如果包含子节点，递归执行此任务
      if (child) {
        const result = editorCursorCalculator(curr);

        // 找到直接返回
        if (result) {
          return result;
        } else {
          return curr;
        }
      } else {
        // 没有子节点直接返回当前节点
        return curr;
      }
    }

    // 查找下一个节点
    curr = curr.getNext();
  }

  return null;
}

// #endregion

// ---------------------
// =====================

// #region set

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

// #endregion

// ---------------------
// =====================

// #region get

/**
 * 获取文档选区
 *
 * @returns
 */
function getSelection() {
  return window.document.getSelection();
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

/** 获取此次输入 markdown 变化的源码范围 */
function getMarkdownChangeRange(range: StaticRange): IChangeRange {
  const { startContainer, endContainer, startOffset, endOffset } = range;

  // 获取开始的源码偏移
  const start = getMarkdownChangeOffset(startContainer, startOffset);
  // 获取结束的源码偏移
  const end = getMarkdownChangeOffset(endContainer, endOffset, true);

  return { start, end };
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
    let { inputIndex, inputLength } = getSourcePosition(markdownNode);

    // 如果是 endContainer，需要加上 endContainer 元素的源码长度，表示完全选中此元素
    if (isEnd) {
      // 返回源码偏移加表示此节点的源码长度
      return inputIndex + inputLength;
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

/**
 * 获取 HTMLElement
 *
 * @param node
 * @returns
 */
function getElement(node: MarkdownNode) {
  const nodeId = nodeMap.getNodeIdByMap(node);

  if (nodeId) {
    return getElementByNodeId(nodeId);
  }

  return null;
}

/**
 * 获取 HTMLElement
 *
 * @param nodeId
 * @returns
 */
function getElementByNodeId(nodeId: string | null) {
  return editorElement.querySelector(
    '[data-cid="' + nodeId + '"]'
  ) as HTMLElement;
}

// #endregion

// ---------------------
// =====================

// #region is

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
 * 是否是图片文件
 *
 * @param file
 * @returns
 */
function isImageFile(file: File) {
  return file.type.startsWith("image/");
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
 * 是内联节点
 *
 * @param node
 * @returns
 */
function isInlineNode(node: MarkdownNode) {
  return !(node instanceof Block);
}

// #endregion
