import type ContentView from '@/views/abstracts/contentview';

import BlockView from '@/views/abstracts/blockview';

function getClosestBlockView(node: Node): BlockView | null {
  let current: Node | null = node;

  while (current) {
    const view = current.$view;

    if (view && view instanceof BlockView) {
      return view;
    }

    current = current.parentNode;
  }

  return null;
}

function hasSameBlockViewAncestor(before: Node, after: Node): boolean {
  if (before === after) {
    return true;
  }

  const beforeBlockView = getClosestBlockView(before);
  const afterBlockView = getClosestBlockView(after);

  if (beforeBlockView === null && afterBlockView === null) {
    return false;
  }

  return beforeBlockView === afterBlockView;
}

class DocEventHandler {
  private view: ContentView;

  public constructor(view: ContentView) {
    this.view = view;
  }

  public listenForViewDOM(dom: HTMLElement): void {
    dom.addEventListener('beforeinput', this.onBeforeInput);
  }

  public unlistenForViewDOM(dom: HTMLElement): void {
    dom.removeEventListener('beforeinput', this.onBeforeInput);
  }

  private onBeforeInput = (e: InputEvent): void => {
    const selection = window.document.getSelection();

    if (!selection?.rangeCount) {
      return void 0;
    }

    const range = selection.getRangeAt(0);
    const { startContainer, endContainer, startOffset, endOffset, collapsed } = range;

    const inputType = e.inputType as InputType;

    const isInSameBlock = hasSameBlockViewAncestor(range.startContainer, range.endContainer);

    switch (inputType) {
      // getStaticRange data
      // 插入文本
      case 'insertText':
      // 插入替换文本
      case 'insertReplacementText':
      // 转置最后两个素簇 ab -> ba
      case 'insertTranspose':
        break;

      // 插入换行符
      case 'insertLineBreak':
      // 插入段落
      case 'insertParagraph':
      // 插入有序列表
      case 'insertOrderedList':
      // 插入无序列表
      case 'insertUnorderedList':
      // 插入水平线符号 hr
      case 'insertHorizontalRule':
        break;

      // 替换选区，终止缓冲区区别于剪切板
      case 'insertFromYank':
        break;

      // getStaticRange
      // 拖拽插入内容
      case 'insertFromDrop':
      // 粘贴插入内容
      case 'insertFromPaste':
        break;

      // 将粘贴的内容作为引用文本插入 blockquote
      case 'insertFromPasteAsQuotation':
        break;

      // getStaticRange data
      // 插入组合输入文本
      case 'insertCompositionText':
        break;

      // 插入链接 data
      case 'insertLink':
        break;

      // getStaticRange
      // 删除前面一个 **单词** 或选区
      case 'deleteWordBackward':
      // 删除到前面一个换行符
      case 'deleteSoftLineBackward':
      // 删除到前面一个 br 换行符
      case 'deleteHardLineBackward':
        break;

      // 删除到前面一个字符或选区
      case 'deleteContentBackward':
        break;

      // getStaticRange
      // 删除后面一个 **单词** 或选中字符
      case 'deleteWordForward':
      // 删除到后面一个换行符
      case 'deleteSoftLineForward':
      // 删除到后面一个 br 换行符
      case 'deleteHardLineForward':
        break;

      // 删除到后面一个字符或选区
      case 'deleteContentForward':
        break;

      // getStaticRange
      // 从前面的换行符删除到后面的换行符
      case 'deleteEntireSoftLine':
        break;

      // getStaticRange
      // 拖拽删除，一般选中编辑器内容后拖拽到其他位置触发
      case 'deleteByDrag':
      // 剪切删除
      case 'deleteByCut':
        break;

      // getStaticRange
      // 删除选择，不指定删除的方向
      // case 'deleteContent':
      //   break;

      // 撤销
      case 'historyUndo':
      // 重做
      case 'historyRedo':
        break;

      // 粗体 <strong></strong>
      case 'formatBold':
      // 斜体 <em></em>
      case 'formatItalic':
      // 下划线 <u></u>
      case 'formatUnderline':
      // 删除线 <del></del>
      case 'formatStrikeThrough':
      // 上标 <sup></sup>
      case 'formatSuperscript':
      // 下标 <sub></sub>
      case 'formatSubscript':
        break;

      // 增加缩进
      case 'formatIndent':
      // 减少缩进
      case 'formatOutdent':
        break;

      // 移除格式
      case 'formatRemove':
        break;

      // 两端对齐
      // case 'formatJustifyFull':
      // 居中对齐
      // case 'formatJustifyCenter':
      // 右对齐
      // case 'formatJustifyRight':
      // 左对齐
      // case 'formatJustifyLeft':
      //   break;

      // 设置块级文本方向 data
      // case 'formatSetBlockTextDirection':
      //   break;
      // 设置行内文本方向 data
      // case 'formatSetInlineTextDirection':
      //   break;
      // 设置背景颜色 data
      // case 'formatBackColor':
      //   break;
      // 设置字体颜色 data
      // case 'formatFontColor':
      //   break;
      // 设置字体 data
      // case 'formatFontName':
      //   break;

      default:
        e.preventDefault();

        break;
    }
  };

  public static create(view: ContentView): DocEventHandler {
    return new this(view);
  }
}

export default DocEventHandler;
