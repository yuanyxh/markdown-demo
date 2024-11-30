export interface IWalker {
  entering: boolean;
  node: MarkdownNode;
}

export interface ILinkRefMap {
  [key: string]: {
    title: string;
    destination: string;
  };
}

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

export class NodeWalker {
  entering = true;

  root: MarkdownNode;
  current: MarkdownNode | null;

  constructor(root: MarkdownNode) {
    this.root = root;
    this.current = root;
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

  resumeAt(node: MarkdownNode, entering: boolean) {
    this.current = node;
    this.entering = entering === true;
  }
}

class MarkdownNode {
  private _type = "MarkdownNode";

  private _parent: MarkdownNode | null = null;
  private _firstChild: MarkdownNode | null = null;
  private _lastChild: MarkdownNode | null = null;
  private _prev: MarkdownNode | null = null;
  private _next: MarkdownNode | null = null;

  readonly sourcepos: TSourcePos;

  open = true;

  string_content = "";
  literal: string | null = null;
  listData: IListData = {};
  info: string | null = null;
  destination: string | null = null;
  title: string | null = null;
  isFenced = false;
  fenceChar: string | null = null;
  fenceLength = 0;
  fenceOffset: number | null = null;
  level: number | null = null;
  htmlBlockType: number = -1;

  onEnter: string | null = null;
  onExit: string | null = null;

  constructor(
    nodeType: string,
    sourcepos: TSourcePos = [
      [0, 0],
      [0, 0],
    ]
  ) {
    this._type = nodeType;
    this.sourcepos = sourcepos;
  }

  get type() {
    return this._type;
  }

  get parent() {
    return this._parent;
  }

  get firstChild() {
    return this._firstChild;
  }

  get lastChild() {
    return this._lastChild;
  }

  get prev() {
    return this._prev;
  }

  get next() {
    return this._next;
  }

  get listType() {
    return this.listData.type;
  }

  set listType(type: TListType | undefined) {
    this.listData.type = type;
  }

  get listTight() {
    return this.listData.tight;
  }

  set listTight(tight: boolean | undefined) {
    this.listData.tight = tight;
  }

  get listStart() {
    return this.listData.start;
  }

  set listStart(start: number | undefined) {
    this.listData.start = start;
  }

  get listDelimiter() {
    return this.listData.delimiter;
  }

  set listDelimiter(listDelimiter: string | undefined) {
    this.listData.delimiter = listDelimiter;
  }

  get isContainer() {
    return isContainer(this);
  }

  appendChild(child: MarkdownNode) {
    child.unlink();
    child._parent = this;

    if (this._lastChild) {
      this._lastChild._next = child;
      child._prev = this._lastChild;
      this._lastChild = child;
    } else {
      this._firstChild = child;
      this._lastChild = child;
    }
  }

  prependChild(child: MarkdownNode) {
    child.unlink();
    child._parent = this;

    if (this._firstChild) {
      this._firstChild._prev = child;
      child._next = this._firstChild;
      this._firstChild = child;
    } else {
      this._firstChild = child;
      this._lastChild = child;
    }
  }

  unlink() {
    if (this._prev) {
      this._prev._next = this._next;
    } else if (this._parent) {
      this._parent._firstChild = this._next;
    }

    if (this._next) {
      this._next._prev = this._prev;
    } else if (this._parent) {
      this._parent._lastChild = this._prev;
    }

    this._parent = null;
    this._next = null;
    this._prev = null;
  }

  insertAfter(sibling: MarkdownNode) {
    sibling.unlink();
    sibling._next = this._next;

    if (sibling._next) {
      sibling._next._prev = sibling;
    }

    sibling._prev = this;
    this._next = sibling;
    sibling._parent = this._parent;

    if (!sibling._next && sibling._parent) {
      sibling._parent._lastChild = sibling;
    }
  }

  insertBefore(sibling: MarkdownNode) {
    sibling.unlink();
    sibling._prev = this._prev;

    if (sibling._prev) {
      sibling._prev._next = sibling;
    }

    sibling._next = this;
    this._prev = sibling;
    sibling._parent = this._parent;

    if (!sibling._prev && sibling._parent) {
      sibling._parent._firstChild = sibling;
    }
  }

  walker() {
    const walker = new NodeWalker(this);

    return walker;
  }
}

export default MarkdownNode;

/* Example of use of walker:

 const walker = w.walker();
 const event;

 while (event = walker.next()) {
 console.log(event.entering, event.node.type);
 }

 */
