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
  Node,
} from "./packages/commonmark";
import { AttributeProviderContext } from "./packages/commonmark/renderer";

const nodeMap = new Map<string, Node>();
let nextId = 1;
class NodeMapAttributeProvider implements AttributeProvider {
  setAttributes(
    node: Node,
    tagName: string,
    attributes: Map<string, string>
  ): void {
    const id = `node-${nextId++}`;

    attributes.set("data-id", id);

    nodeMap.set(id, node);
  }
}

class NodeMapAttributeProviderFactory implements AttributeProviderFactory {
  create(context: AttributeProviderContext): AttributeProvider {
    return new NodeMapAttributeProvider();
  }
}

let markdownText = "";
let ele!: HTMLElement;

const htmlRenderer = HtmlRenderer.builder()
  .attributeProviderFactory(new NodeMapAttributeProviderFactory())
  .build();

function reRender(markdownText: string) {
  const document = parser.parse(markdownText);

  const html = htmlRenderer.render(document);

  if (ele) {
    ele.innerHTML = html;
  }
}

const onBeforeInput = (e: InputEvent) => {
  e.preventDefault();
  const ranges = e.getTargetRanges();

  const [range] = ranges;

  let start = 0;
  let end = 0;
  if (range.startContainer instanceof Text) {
    const startParent = range.startContainer.parentElement;
    const id = startParent?.dataset.id;

    const textIndex = Array.from(startParent?.childNodes || []).findIndex(
      (ele) => ele === range.startContainer
    );

    if (id) {
      const startNodeParent = nodeMap.get(id);

      let i = 1;
      let textNode = startNodeParent?.getFirstChild();

      while (i < textIndex && textNode) {
        i++;

        textNode = textNode.getNext();
      }

      if (textNode) {
        const span = textNode.getSourceSpans()[0];
        start = (span?.getInputIndex() || 0) + range.startOffset;
      }
    }
  }

  if (range.endContainer instanceof Text) {
    const endParent = range.endContainer.parentElement;
    const id = endParent?.dataset.id;

    const textIndex = Array.from(endParent?.childNodes || []).findIndex(
      (ele) => ele === range.endContainer
    );

    if (id) {
      const endNodeParent = nodeMap.get(id);

      let i = 1;
      let textNode = endNodeParent?.getFirstChild();

      while (i < textIndex && textNode) {
        i++;

        textNode = textNode.getNext();
      }

      if (textNode) {
        const span = textNode.getSourceSpans()[0];
        end = (span?.getInputIndex() || 0) + range.endOffset;
      }
    }
  }

  console.log(e.inputType);
  console.log(range);
  console.log(start, end);

  if (e.inputType === "insertText") {
    markdownText =
      markdownText.slice(0, start) + e.data + markdownText.slice(end);

    const selection = window.document.getSelection();
    let savedRange!: Range;
    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0);
      console.log(savedRange.startContainer, savedRange.startOffset);
      console.log(savedRange.endContainer, savedRange.endOffset);
    }

    reRender(markdownText);

    if (savedRange) {
      console.log(savedRange);
      const newSelection = window.document.getSelection();
      const newRange = document.createRange();
      newRange.setStart(savedRange.startContainer, savedRange.startOffset);
      newRange.setEnd(savedRange.endContainer, savedRange.endOffset);
      newSelection?.removeAllRanges();
      newSelection?.addRange(newRange);
    }
  }
};

const parser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

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

      const html = htmlRenderer.render(document);

      if (editorRef.current) {
        ele = editorRef.current;
        editorRef.current.innerHTML = html;

        editorRef.current.addEventListener("beforeinput", onBeforeInput);
      }
    });
  };

  const handleBeforeInput = (e: React.FormEvent<HTMLElement>) => {
    console.log(e.nativeEvent);
    e.preventDefault();
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
