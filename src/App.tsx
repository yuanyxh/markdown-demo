import { Button } from "antd";

import "./styles/App.less";
import { useRef } from "react";

import { readFileAsText } from "./utils";
import {
  HtmlRenderer,
  IncludeSourceSpans,
  Parser,
} from "./packages/commonmark";

const parser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

const App: React.FC = () => {
  const triggerRef = useRef<HTMLInputElement>(null);

  const handleSelectMarkdown = () => {
    triggerRef.current?.click();
  };

  const handleFileSelectChange = () => {
    const [file] = triggerRef.current?.files || [];

    if (!file) {
      return void 0;
    }

    readFileAsText(file).then((text) => {
      const document = parser.parse(text);
      const htmlRenderer = HtmlRenderer.builder().build();
      const html = htmlRenderer.render(document);

      console.log(html);

      const input = document
        .getFirstChild()
        ?.getFirstChild()
        ?.getSourceSpans()[0]
        .getInputIndex();

      console.log(input);
    });
  };

  return (
    <div className="app">
      <Button type="primary" onClick={handleSelectMarkdown}>
        选择 Markdown
      </Button>

      <div className="container">
        <input
          ref={triggerRef}
          hidden
          type="file"
          accept=".md"
          onChange={handleFileSelectChange}
        />
      </div>
    </div>
  );
};

export default App;
