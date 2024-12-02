import "normalize.css";
import "./styles/global.less";

import { Parser, HtmlRenderer } from "../commonmark-java-change/commonmark";

import markdown from "./example.md?raw";

console.time("start");
const parser = Parser.builder().build();
const document = parser.parse(markdown);
console.timeEnd("end");
const renderer = HtmlRenderer.builder().build();
const html = renderer.render(document);
console.log(html);
