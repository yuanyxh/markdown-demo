import { Button } from "antd";

import "./styles/App.less";
import { useRef } from "react";

import { Parser } from "./commonmark";

import { readFileAsText } from "./utils";

const App: React.FC = () => {
  const triggerRef = useRef<HTMLInputElement>(null);
  const parser = useRef(new Parser({ time: true }));

  const handleSelectMarkdown = () => {
    triggerRef.current?.click();
  };

  const handleFileSelectChange = () => {
    const [file] = triggerRef.current?.files || [];

    if (!file) {
      return void 0;
    }

    readFileAsText(file).then((text) => {
      const ast = parser.current.parse("          \t");

      console.log(ast);
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
