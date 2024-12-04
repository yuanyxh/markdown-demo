import "normalize.css";
import "./styles/global.less";

import { Parser, HtmlRenderer } from "../commonmark-java-change/commonmark";

import markdown from "./example.md?raw";

const parser = Parser.builder().build();
console.time("parser");
const document = parser.parse(markdown);
console.timeEnd("parser");

console.log(document);

console.time("html");
const htmlRenderer = HtmlRenderer.builder().build();
const html = htmlRenderer.render(document);
console.log(html);
console.timeEnd("html");
