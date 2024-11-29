import "normalize.css";
import "./styles/global.less";

import {
  Parser,
  IncludeSourceSpans,
  HtmlRenderer,
  FencedCodeBlock,
  Text as MarkdownText,
} from "./packages/commonmark";

import { readFileAsText } from "./utils";

import { NodeMapAttributeProviderFactory } from "./attribute-provider";

import type { MarkdownNode } from "./packages/commonmark";

/** 编辑器 dom 元素 */
const editor = window.document.getElementById("editor")!;
/** 文件选择器 */
const fileSelect = window.document.getElementById(
  "fileSelect"
)! as HTMLInputElement;
/** 文件选择触发器 */
const fileTrigger = window.document.getElementById("fileTrigger")!;
const resetMarkdown = window.document.getElementById("reset")!;

/** 触发文件选择 */
fileTrigger.addEventListener("click", () => {
  fileSelect.click();
});

/** 获取 markdown 并解析渲染 */
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

    backupMarkdownText = text;
  });

  fileSelect.value = "";
});

resetMarkdown.addEventListener("click", () => {
  renderToHTML(backupMarkdownText);
});

/** 侦听 beforeinput 事件，可修改默认行为 */
editor.addEventListener("beforeinput", onBeforeInput);

/** 生成唯一 id，绑定 dom 和 markdownNode */
const nodeMapAttributeProviderFactory = new NodeMapAttributeProviderFactory();

/** markdown 解析器 */
const parser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

/** markdown ast 渲染器 */
const htmlRenderer = HtmlRenderer.builder()
  .attributeProviderFactory(nodeMapAttributeProviderFactory)
  .build();

/** markdown 纯文本 */
let markdownText = "";
/** markdown ast 根节点 */
let markdownDocument!: MarkdownNode;

/** 备份 */
let backupMarkdownText = markdownText;

function getSourcePosition(node?: MarkdownNode | null) {
  if (!node) {
    throw new Error("Must be have a node param");
  }

  const spans = node.getSourceSpans();
  const inputIndex = spans[0].getInputIndex();
  const inputLength = spans[spans.length - 1].getLength();

  return { inputIndex, inputLength, inputEndIndex: inputIndex + inputLength };
}

/** 将 markdown 文本解析渲染为 html */
function renderToHTML(markdown: string) {
  markdownText = markdown;

  /** markdown 文本解析为 MarkdownNode */
  markdownDocument = parser.parse(markdown);

  /** 渲染为 html */
  const html = htmlRenderer.render(markdownDocument);

  /** set innerHTML */
  editor.innerHTML = html;
}

/** 获取更新后的 markdown 文本 */
function getUpdatedMarkdown(
  markdown: string,
  start: number,
  end: number,
  type: string,
  data = ""
) {
  let newMarkdown = "";

  switch (type) {
    /** 插入文本 */
    case "insertText":
      newMarkdown = markdown.slice(0, start) + data + markdown.slice(end);
      break;
    /** 删除文本 */
    case "deleteContentBackward":
      console.log(markdown.slice(start, end));

      newMarkdown = markdown.slice(0, start) + markdown.slice(end);
      break;
    /** 插入段落 */
    case "insertParagraph":
      newMarkdown = markdown.slice(0, start) + "\n\n" + markdown.slice(end);
      break;
    default:
      break;
  }

  return newMarkdown;
}

/** 获取此次输入 markdown 改变的源码范围 */
function getMarkdownChangeOffset(
  container: Node,
  offset: number,
  isEnd = false
) {
  // 如果 container 为文本，找到父元素 (文本节点无法添加 attribute)
  if (container instanceof Text) {
    const parent = container.parentElement;

    // 父元素不存在或未绑定 id 视为异常
    if (!(parent && parent.dataset.id)) {
      console.error(container, offset);

      throw new Error("Nullable for parent or parent.dataset.id");
    }

    // 找到父元素对应的 MarkdownNode
    const parentMarkdownNode = nodeMapAttributeProviderFactory.getNode(
      parent.dataset.id
    );

    // 找到当前文本元素在父元素中的位置
    let index = Array.from(parent.childNodes).findIndex(
      (ele) => ele === container
    );

    let markdownOffset = 0;

    // 如果父级 MarkdownNode 为围栏代码块，则不存在子级 Text Node
    // 需要手动加去围栏代码块的开始长度以匹配文本的源码偏移
    if (parentMarkdownNode instanceof FencedCodeBlock) {
      // 找到围栏代码块的源码偏移
      ({ inputIndex: markdownOffset } = getSourcePosition(parentMarkdownNode));

      // 加上缩进，不超过 4
      markdownOffset += parentMarkdownNode.getFenceIndent() || 0;
      // 加上开始围栏的文本长度
      markdownOffset += parentMarkdownNode.getOpeningFenceLength() || 0;
      // 加上信息字符串的长度
      markdownOffset += parentMarkdownNode.getInfo()?.length || 0;
      // 默认加上一个 \n 换行符的位置
      markdownOffset += 1;
    } else {
      // 如果父级不为围栏代码块，默认找到子级 MarkdownNode
      let childMarkdownNode = parentMarkdownNode?.getFirstChild();

      let cursor = 0;
      while (cursor < index) {
        cursor++;
        childMarkdownNode = childMarkdownNode?.getNext();
      }

      // 没找到视为异常
      if (!childMarkdownNode) {
        console.error(container, offset);

        throw new Error("Can not find the markdown node.");
      }

      // 获取源码偏移
      ({ inputIndex: markdownOffset } = getSourcePosition(childMarkdownNode));
    }

    // 源码偏移 + range.[start|end]Offset 等于改变位置的源码偏移
    return markdownOffset + offset;
  }

  // 如果 container 不为文本，默认为 HTML 元素
  const element = container as HTMLElement;

  // 没有元素或没有绑定 id 视为异常
  if (!(element && element.dataset.id)) {
    console.error(container, offset);

    throw new Error("Nullable for element or element.dataset.id");
  }

  // 找到元素对应的 MarkdownNode
  const parentMarkdownNode = nodeMapAttributeProviderFactory.getNode(
    element.dataset.id
  );

  // 如果 offset 为 0，默认取 container 的源码偏移
  if (offset === 0) {
    const { inputIndex: markdownOffset } =
      getSourcePosition(parentMarkdownNode);

    // 如果是 endContainer，需要加上 endContainer 元素的源码长度，表示完全选中此元素
    if (isEnd) {
      const { inputIndex: markdownLength } =
        getSourcePosition(parentMarkdownNode);

      // 返回源码偏移加表示此节点的源码长度
      return markdownOffset + markdownLength;
    }

    // 取得的数据异常
    if (typeof markdownOffset === "undefined") {
      console.error(container, offset);

      throw new Error("Can not get number value with markdown offset");
    }

    // 返回源码偏移
    return markdownOffset;
  }

  // 如果 offset 不为 0，取对应位置的 MarkdownNode 的源码偏移
  let childMarkdownNode = parentMarkdownNode?.getFirstChild();

  while (--offset > 1) {
    childMarkdownNode = childMarkdownNode?.getNext();
  }

  const { inputIndex: markdownOffset, inputLength: markdownLength } =
    getSourcePosition(childMarkdownNode);

  // 取得的数据异常
  if (
    typeof markdownOffset === "undefined" ||
    typeof markdownLength === "undefined"
  ) {
    console.error(container, offset);

    throw new Error(
      "Can not get number value with markdown offset or markdown length"
    );
  }

  // endContainer 加上此节点的源码长度
  if (isEnd) {
    return markdownOffset + markdownLength;
  }

  // 返回源码偏移
  return markdownOffset;
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

/** 根据 id 获取 HTML 元素 */
function getElementById(id: string) {
  return editor.querySelector(`[data-id="${id}"]`);
}

/** 根据源码位置找到对应的 MarkdownNode */
function findMarkdownNodeByRange(
  node: MarkdownNode,
  position: number
): MarkdownNode | undefined {
  // 获取父节点的第一个子节点
  let curr = node.getFirstChild();

  // 迭代子节点
  while (curr) {
    // 获取当前节点的源码偏移与节点的源码长度
    const { inputIndex: offset, inputLength: length } = getSourcePosition(curr);
    // 获取到节点在源码中的结束位置
    const endOffset = offset + length;

    const child = curr.getFirstChild();

    // 位置与开始或结束相等，直接返回当前元素
    // if (position === offset || position === endOffset) {
    //   return curr;
    // }

    // 如果位置在当前节点内
    if (position >= offset && position <= endOffset) {
      // 如果包含子节点，递归执行此任务
      if (child) {
        const result = findMarkdownNodeByRange(curr, position);

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
}

/** 根据源码位置找到新的文档选区 */
function findSelectionByRange(changeOffset: number) {
  /** 找到新的开始 MarkdownNode */
  const markdownNode = findMarkdownNodeByRange(markdownDocument, changeOffset);

  // 必须存在且为 Text 节点
  if (!markdownNode) {
    // FIXME: 删除图片报错
    throw new Error("Can not find the markdown node by changeOffset");
  }

  if (!(markdownNode instanceof MarkdownText)) {
    throw new Error("find markdown node is not a Text Node");
  }

  // 找到此节点的父级
  const parentMarkdownNode = markdownNode.getParent();

  // 必须存在
  if (!parentMarkdownNode) {
    throw new Error("Can not get markdownNode parent");
  }

  let index = 0;
  let child = parentMarkdownNode.getFirstChild();

  // 找到节点在父级中的位置
  while (child && child !== markdownNode) {
    index++;
    child = child.getNext();
  }

  // 找到父级 Markdown 对应的 HTML 元素
  const id = nodeMapAttributeProviderFactory.getId(parentMarkdownNode);

  if (typeof id === "undefined") {
    throw new Error("Can not get id from the binding parentMarkdownNode");
  }

  const parent = getElementById(id);

  // 必须存在
  if (!parent) {
    throw new Error("Can not get the parent element");
  }

  // 找到 markdownNode 对应的 Dom 节点
  const target = parent.childNodes[index];

  // 必须存在
  if (!target) {
    throw new Error("Can not get target element");
  }

  // 获取选区在 DOM 节点中的偏移
  const rangeOffset = changeOffset - getSourcePosition(markdownNode).inputIndex;

  return {
    rangeContainer: target,
    rangeOffset: rangeOffset,
  };
}

function processRange(range: StaticRange, type: string, data: string) {
  const { startChangeOffset, endChangeOffset } = getMarkdownChangeRange(range);

  renderToHTML(
    getUpdatedMarkdown(
      markdownText,
      startChangeOffset,
      endChangeOffset,
      type,
      data
    )
  );

  const { rangeContainer, rangeOffset } =
    findSelectionByRange(startChangeOffset);

  console.log(rangeContainer, rangeOffset);

  // console.log(type);
  // console.log(data);
  // console.log(startChangeOffset, endChangeOffset);
}

function onBeforeInput(e: InputEvent) {
  e.preventDefault();

  const [range] = e.getTargetRanges();

  if (window.document.activeElement === editor) {
    const selection = window.document.getSelection();
    selection?.removeAllRanges();

    processRange(range, e.inputType, e.data || "");
  }
}
