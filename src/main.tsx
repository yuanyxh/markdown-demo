import "normalize.css";
import "./styles/global.less";

import {
  Parser,
  HtmlRenderer,
  MarkdownRenderer,
  TextContentRenderer,
} from "../commonmark-java-change/commonmark";
import { Appendable } from "../commonmark-java-change/helpers";

import markdown from "./example.md?raw";

console.time("parser");
const parser = Parser.builder().build();
const document = parser.parse(markdown);
console.timeEnd("parser");

console.log(document);

console.time("html");
const htmlRenderer = HtmlRenderer.builder().build();
const html = htmlRenderer.render(document);
console.log(html);
console.timeEnd("html");

// console.time("markdown");
// const markdownRenderer = MarkdownRenderer.builder().build();
// const markdownTextBuffer = new Appendable();
// markdownRenderer.render(document, markdownTextBuffer);
// console.log(markdownTextBuffer.toString());
// console.timeEnd("markdown");

// console.time("text");
// const textContentRenderer = TextContentRenderer.builder().build();
// const textBuffer = new Appendable();
// textContentRenderer.render(document, textBuffer);
// console.log(textBuffer.toString());
// console.timeEnd("text");
