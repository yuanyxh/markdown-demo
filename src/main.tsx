import "normalize.css";
import "./styles/global.less";

import { createEditorElement } from "./utils";

// 创建一个 Editor 实例
const editorElement = createEditorElement();
window.document.getElementById("root")!.appendChild(editorElement);

// 侦听 beforeinput 事件，处理除 composition 外的所有输入类型
editorElement.addEventListener("beforeinput", onBeforeInput);
// 处理 composition 输入事件
editorElement.addEventListener("compositionend", onCompositionEnd);
// 处理选区变化事件
window.document.addEventListener("selectionchange", onSelectionChange);

/** 替换文本的输入类型 */
const replacementInputTypeList = [
  /** 在选区后插入文本, 取 data */ "insertText",
  /** 替换文本, 取 dataTransfer */ "insertReplacementText",
  /** 插入软换行符 \n */ "insertLineBreak",
  /** 在下方插入段落，光标后的内容作为新段落内容 */ "insertParagraph",
  /** 在下方插入有序列表 */ "insertOrderedList",
  /** 在下方插入无序列表 */ "insertUnorderedList",
  /** 缓冲区内容替换选区, 取 dataTransfer */ "insertFromYank",
  /** 拖拽插入内容, 取 dataTransfer */ "insertFromDrop",
  /** 剪切板插入内容, 取 dataTransfer */ "insertFromPaste",
  /** 插入链接 */ "insertLink",
];

/** 删除文本的输入类型 */
const deleteContentInputTypeList = [
  /** 删除前一个单词 */ "deleteWordBackward",
  /** 删除后一个单词 */ "deleteWordForward",
  /** 拖拽删除 */ "deleteByDrag",
  /** 剪切删除 */ "deleteByCut",
  /** 删除选区 */ "deleteContent",
  /** 删除光标前字符或选区内容 */ "deleteContentBackward",
  /** 删除光标后字符或选区内容 */ "deleteContentForward",
  /** 从选区向前删除到最近的换行符 */ "deleteSoftLineBackward",
  /** 从选区向后删除到最近的换行符 */ "deleteSoftLineForward",
  /** 从选区前最近的换行符删除到选区后最近的换行符 */ "deleteEntireSoftLine",
  /** 从选区向前删除到块或 br */ "deleteHardLineBackward",
  /** 从选区向后删除到块或 br */ "deleteHardLineForward",
];

// 当前选区范围
let range: Range | null = null;

// 处理编辑器选区变化事件，获取当前编辑的作用域范围
function onSelectionChange() {
  if (window.document.activeElement !== editorElement) {
    return false;
  }

  const selection = window.document.getSelection();

  if (selection && selection.rangeCount) {
    range = selection.getRangeAt(0);

    // 保证只有一个选区范围
    if (selection.rangeCount > 1) {
      for (let i = 1; i < selection.rangeCount; i++) {
        selection.removeRange(selection.getRangeAt(i));
      }
    }
  }
}

// 处理除 composition 外的所有输入事件
function onBeforeInput(e: InputEvent) {
  e.preventDefault();

  if (e.isComposing) {
    return false;
  }

  if (replacementInputTypeList.includes(e.inputType)) {
    // 替换内容
    replaceContent(e);
  } else if (deleteContentInputTypeList.includes(e.inputType)) {
    // 删除内容
    deleteContent(e);
  }
}

// 处理 composition 输入事件
function onCompositionEnd(e: CompositionEvent) {
  if (!e.data) {
    return false;
  }
}

function replaceContent(e: InputEvent) {
  let data = "";

  switch (e.inputType) {
    case "insertText":
    case "insertLink":
      data = e.data || "";
      break;
    case "insertLineBreak":
      data = "\n";
      break;
    case "insertParagraph":
      break;
    case "insertOrderedList":
      break;
    case "insertUnorderedList":
      break;
    case "insertReplacementText":
    case "insertFromYank":
    case "insertFromDrop":
    case "insertFromPaste":
      /** 写个方法获取 dataTransfer（图片、plain text、html） */
      break;
    default:
      break;
  }
}

function deleteContent(e: InputEvent) {}
