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

const nodeMap = new Map<string, MarkdownNode>();
let nextId = 1;
class NodeMapAttributeProvider implements AttributeProvider {
  setAttributes(
    node: MarkdownNode,
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

/** 重渲染 */
function reRender(markdownText: string) {
  const document = parser.parse(markdownText);

  const html = htmlRenderer.render(document);

  if (ele) {
    ele.innerHTML = html;
  }
}

function getMarkdownNodes(sC: Node, eC: Node) {}

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
