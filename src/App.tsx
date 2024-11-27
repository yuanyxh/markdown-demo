import { Button } from "antd";

import "./styles/App.less";
import { useRef } from "react";

import { readFileAsText } from "./utils";
import {
  HtmlRenderer,
  IncludeSourceSpans,
  Parser,
} from "./packages/commonmark";
import type {
  AttributeProvider,
  AttributeProviderFactory,
  MarkdownNode,
} from "./packages/commonmark";
import { AttributeProviderContext } from "./packages/commonmark/renderer";

class NodeMapAttributeProvider implements AttributeProvider {
  setAttributes(
    node: MarkdownNode,
    tagName: string,
    attributes: Map<string, string>
  ): void {
    const id = `node-${nextId++}`;

    attributes.set("data-id", id);

    markdownNodeMap.set(id, node);
    markdownNodeRecordMap.set(node, id);
  }
}

class NodeMapAttributeProviderFactory implements AttributeProviderFactory {
  create(context: AttributeProviderContext): AttributeProvider {
    return new NodeMapAttributeProvider();
  }
}

const markdownNodeMap = new Map<string, MarkdownNode>();
const markdownNodeRecordMap = new Map<MarkdownNode, string>();
let nextId = 1;

let markdownText = "";
let ele!: HTMLElement;
let markdownNode!: MarkdownNode;

const parser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

const htmlRenderer = HtmlRenderer.builder()
  .attributeProviderFactory(new NodeMapAttributeProviderFactory())
  .build();

/** 重渲染 */
function reRender(markdownText: string) {
  markdownNodeMap.clear();
  markdownNodeRecordMap.clear();
  nextId = 1;
  const document = parser.parse(markdownText);
  markdownNode = document;

  const html = htmlRenderer.render(document);

  if (ele) {
    ele.innerHTML = html;
  }
}

function getElementNodes(sC: Node, eC: Node) {
  let sCEle = sC.parentElement;
  let eCEle = sC.parentElement;

  if (sC instanceof HTMLElement) {
    sCEle = sC;
  }

  if (eC instanceof HTMLElement) {
    eCEle = eC;
  }

  return [sCEle, eCEle] as [HTMLElement, HTMLElement];
}

function getMarkdownNodes(sCEle: HTMLElement, eCEle: HTMLElement) {
  const startNodeId = sCEle.dataset.id!;
  const endNodeId = sCEle.dataset.id!;

  const startNode = markdownNodeMap.get(startNodeId)!;
  const endNode = markdownNodeMap.get(endNodeId)!;

  return [startNode, endNode];
}

function getNewMarkdownText(
  markdown: string,
  start: number,
  end: number,
  data: string
) {
  return markdown.slice(0, start) + data + markdown.slice(end);
}

interface IMarkdownSelectionRangeOptions {
  sC: Node;
  eC: Node;
  sCEle: HTMLElement;
  eCEle: HTMLElement;
  sCMarkdownNode: MarkdownNode;
  eCMarkdownNode: MarkdownNode;
  sF: number;
  eF: number;
}
function getMarkdownSelectionRange(options: IMarkdownSelectionRangeOptions) {
  const { sC, eC, sCEle, eCEle, sCMarkdownNode, eCMarkdownNode, sF, eF } =
    options;

  let startChildIndex = 0;
  let endChildIndex = 0;

  if (sCEle !== sC) {
    startChildIndex = Array.from(sCEle.childNodes).findIndex(
      (ele) => sC === ele
    );
  }
  if (sCEle !== sC) {
    endChildIndex = Array.from(eCEle.childNodes).findIndex((ele) => eC === ele);
  }

  let startNode = sCMarkdownNode.getFirstChild()!;
  let endNode = eCMarkdownNode.getFirstChild()!;

  for (let i = 0; i < startChildIndex; i++) {
    startNode = startNode!.getNext()!;
  }
  for (let i = 0; i < endChildIndex; i++) {
    endNode = endNode!.getNext()!;
  }

  const markdownRangeStartOffset = getMarkdownOffset(startNode) + sF;
  const markdownRangeEndOffset = getMarkdownOffset(endNode) + eF;

  return { markdownRangeStartOffset, markdownRangeEndOffset };
}

function getMarkdownOffset(node: MarkdownNode) {
  return node.getSourceSpans()[0].getInputIndex();
}

function getMarkdownNodeLength(node: MarkdownNode) {
  return node.getSourceSpans()[0].getLength();
}

function getNewMarkdownNodeOffset(
  markdownNode: MarkdownNode,
  markdownNodeMap: Map<string, MarkdownNode>,
  markdownRangeStartOffset: number,
  markdownRangeEndOffset: number
) {
  let node = markdownNode.getFirstChild();

  while (node) {
    const offset = getMarkdownOffset(node);
    const length = getMarkdownNodeLength(node);

    const endOffset = offset + length;

    if (
      (markdownRangeStartOffset >= offset &&
        markdownRangeEndOffset <= endOffset) ||
      (markdownRangeEndOffset >= offset && markdownRangeEndOffset <= endOffset)
    ) {
      const firstChild = node.getFirstChild();
      if (firstChild) {
        const childOffset = getMarkdownOffset(firstChild);

        const cursorInChild = markdownRangeStartOffset - childOffset;

        const id = markdownNodeRecordMap.get(node)!;

        const element = ele.querySelector(`[data-id="${id}"]`)!;
        const textNode = element.childNodes[0];

        const range = document.createRange();
        range.setStart(textNode, cursorInChild + 1);
        range.collapse(true);
        const selection = document.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    node = node.getNext();
  }
}

const onBeforeInput = (e: InputEvent) => {
  e.preventDefault();

  // the insertText process
  const ranges = e.getTargetRanges();

  const [range] = ranges;
  const {
    startContainer: sC,
    startOffset: sF,
    endContainer: eC,
    endOffset: eF,
  } = range;

  const [sCEle, eCEle] = getElementNodes(sC, eC);

  const [sCMarkdownNode, eCMarkdownNode] = getMarkdownNodes(sCEle, eCEle);

  const { markdownRangeStartOffset, markdownRangeEndOffset } =
    getMarkdownSelectionRange({
      sC,
      eC,
      sCEle,
      eCEle,
      sCMarkdownNode,
      eCMarkdownNode,
      sF,
      eF,
    });

  markdownText = getNewMarkdownText(
    markdownText,
    markdownRangeStartOffset,
    markdownRangeEndOffset,
    e.data || ""
  );

  reRender(markdownText);

  getNewMarkdownNodeOffset(
    markdownNode,
    markdownNodeMap,
    markdownRangeStartOffset,
    markdownRangeEndOffset
  );
};

const App: React.FC = () => {
  const triggerRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSelectMarkdown = () => {
    triggerRef.current?.click();
  };

  const handleFileSelectChange = () => {
    const [file] = triggerRef.current?.files || [];

    if (!file) {
      return void 0;
    }

    readFileAsText(file).then((text) => {
      markdownText = text;

      const document = parser.parse(text);

      markdownNode = document;

      const html = htmlRenderer.render(document);

      if (editorRef.current) {
        ele = editorRef.current;
        editorRef.current.innerHTML = html;

        editorRef.current.addEventListener("beforeinput", onBeforeInput);
      }
    });
  };

  return (
    <div className="app">
      <Button type="primary" onClick={handleSelectMarkdown}>
        选择 Markdown
      </Button>

      <div
        ref={editorRef}
        className="container"
        spellCheck={false}
        contentEditable={true}
      ></div>

      <input
        ref={triggerRef}
        hidden
        type="file"
        accept=".md"
        onChange={handleFileSelectChange}
      />
    </div>
  );
};

export default App;
