import { IListData, TMarkdownNodeType, TSourcePos } from "./types";

/**
 *
 * @description 是否是容器节点
 * @param node
 * @returns
 */
function isContainer(node: MarkdownNode) {
  switch (node.type) {
    case "document":
    case "block_quote":
    case "list":
    case "item":
    case "paragraph":
    case "heading":
    case "emph":
    case "strong":
    case "link":
    case "image":
    case "custom_inline":
    case "custom_block":
      return true;
    default:
      return false;
  }
}

class NodeWalker {
  private root: MarkdownNode;
  private current: MarkdownNode | null;

  entering = true;

  constructor(root: MarkdownNode) {
    this.root = root;
    this.current = root;
  }

  resumeAt(node: MarkdownNode, entering: boolean) {
    this.current = node;
    this.entering = entering === true;
  }

  next() {
    const cur = this.current;
    const entering = this.entering;

    if (cur === null) {
      return null;
    }

    const container = isContainer(cur);

    if (entering && container) {
      if (cur.firstChild) {
        this.current = cur.firstChild;
        this.entering = true;
      } else {
        // stay on node but exit
        this.entering = false;
      }
    } else if (cur === this.root) {
      this.current = null;
    } else if (cur.next === null) {
      this.current = cur.parent;
      this.entering = false;
    } else {
      this.current = cur.next;
      this.entering = true;
    }

    return { entering: entering, node: cur };
  }
}

class MarkdownNode {
  /** markdown 节点类型 */
  readonly type: TMarkdownNodeType;

  /** 节点对应的源码位置 */
  sourcepos: TSourcePos;

  /** 父节点 */
  parent: MarkdownNode | null = null;

  /** 第一个子节点 */
  firstChild: MarkdownNode | null = null;

  /** 最后一个子节点 */
  lastChild: MarkdownNode | null = null;

  /** 上一个节点 */
  prev: MarkdownNode | null = null;

  /** 下一个节点 */
  next: MarkdownNode | null = null;

  /** 文本数据 */
  literal: string | null = null;

  /** 代码块信息 */
  info: string | null = null;

  /** 图片或链接数据 */
  destination: string | null = null;

  /** 图片或链接标题 */
  title: string | null = null;

  /** 标题级别 */
  level: number | null = null;

  onEnter: string | null = null;

  onExit: string | null = null;

  /** 列表数据 */
  listData: IListData = {
    type: null,
    tight: null,
    start: null,
    delimiter: null,
    padding: null,
    bulletChar: null,
    markerOffset: 0,
  };

  isFenced = false;

  open = true;

  string_content: string | null = null;

  fenceChar: string | null = null;

  fenceLength = 0;

  fenceOffset: number | null = null;

  /** html 块类型 */
  htmlBlockType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null = null;

  constructor(
    nodeType: TMarkdownNodeType,
    sourcepos: TSourcePos = [
      [0, 0],
      [0, 0],
    ]
  ) {
    this.type = nodeType;
    this.sourcepos = sourcepos;
  }

  get isContainer() {
    return isContainer(this);
  }

  get listType() {
    return this.listData.type;
  }

  set listType(type: IListData["type"]) {
    this.listData.type = type;
  }

  get listTight() {
    return this.listData.tight;
  }

  set listTight(tight: IListData["tight"]) {
    this.listData.tight = tight;
  }

  get listStart() {
    return this.listData.start;
  }

  set listStart(start: IListData["start"]) {
    this.listData.start = start;
  }

  get listDelimiter() {
    return this.listData.delimiter;
  }

  set listDelimiter(delimiter: IListData["delimiter"]) {
    this.listData.delimiter = delimiter;
  }

  /** 添加一个子节点 */
  appendChild(child: MarkdownNode) {
    // 子节点删除其他链接
    child.unlink();

    // 父节点指向当前
    child.parent = this;

    if (this.lastChild) {
      this.lastChild.next = child;
      child.prev = this.lastChild;

      this.lastChild = child;
    } else {
      this.firstChild = child;
      this.lastChild = child;
    }
  }

  prependChild(child: MarkdownNode) {
    child.unlink();

    child.parent = this;
    if (this.firstChild) {
      this.firstChild.prev = child;
      child.next = this.firstChild;

      this.firstChild = child;
    } else {
      this.firstChild = child;

      this.lastChild = child;
    }
  }

  /** 取消与其他节点的链接 */
  unlink() {
    if (this.prev) {
      // 将上一个节点的下一个节点指向当前节点的下一个节点
      this.prev.next = this.next;
    } else if (this.parent) {
      // 将父节点的首个节点指向当前节点的下一个节点
      this.parent.firstChild = this.next;
    }

    if (this.next) {
      // 将下一个节点的上一个节点指向当前节点的上一个节点
      this.next.prev = this.prev;
    } else if (this.parent) {
      // 将父节点的最后一个节点指向当前节点的上一个节点
      this.parent.lastChild = this.prev;
    }

    // 删除所有链接
    this.parent = null;
    this.next = null;
    this.prev = null;
  }

  insertAfter(sibling: MarkdownNode) {
    sibling.unlink();
    sibling.next = this.next;

    if (sibling.next) {
      sibling.next.prev = sibling;
    }

    sibling.prev = this;
    this.next = sibling;
    sibling.parent = this.parent;

    if (!sibling.next && sibling.parent) {
      sibling.parent.lastChild = sibling;
    }
  }

  insertBefore(sibling: MarkdownNode) {
    sibling.unlink();
    sibling.prev = this.prev;

    if (sibling.prev) {
      sibling.prev.next = sibling;
    }

    sibling.next = this;
    this.prev = sibling;
    sibling.parent = this.parent;

    if (!sibling.prev && sibling.parent) {
      sibling.parent.firstChild = sibling;
    }
  }

  walker() {
    const walker = new NodeWalker(this);

    return walker;
  }
}

export default MarkdownNode;
