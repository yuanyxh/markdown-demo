import { Button } from "antd";

import "./styles/App.less";
import { useRef } from "react";

import { readFileAsText } from "./utils";
import { Parser } from "../lib_ts/commonmark";

const parser = Parser.builder().build();

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
      console.log(parser.parse(text));
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
