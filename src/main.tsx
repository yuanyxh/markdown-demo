import "normalize.css";
import "./styles/global.less";

import { Parser, HtmlRenderer } from "../commonmark-js-change";

import markdown from "./example.md?raw";

const reader = new Parser({ time: true });
const writer = new HtmlRenderer({ softbreak: "<br />" });
const parsed = reader.parse(markdown);
const result = writer.render(parsed);

console.log(parsed);
console.log(result);
