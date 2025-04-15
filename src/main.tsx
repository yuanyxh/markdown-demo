import 'normalize.css';
import './styles/global.less';
import './styles/editor-init.less';

import source from './examples/example.md?raw';

import {
  BlockQuote,
  BulletList,
  Code,
  Document,
  Emphasis,
  FencedCodeBlock,
  HardLineBreak,
  Heading,
  HtmlBlock,
  HtmlInline,
  Image,
  IncludeSourceSpans,
  IndentedCodeBlock,
  Link,
  LinkReferenceDefinition,
  ListItem,
  MarkdownNode,
  OrderedList,
  Paragraph,
  Parser,
  SoftLineBreak,
  StrongEmphasis,
  Text,
  ThematicBreak
} from 'commonmark-java-js';

import ContentView from 'src/views/abstracts/contentview';
import DocView from 'src/views/docview';
import BlockQuoteView from 'src/views/blockquoteview';
import BulletListView from 'src/views/bulletlistview';
import OrderedListView from 'src/views/orderedlistview';
import ListItemView from 'src/views/listitemview';
import HeadingView from 'src/views/headingview';
import FencedCodeBlockView from 'src/views/fencedcodeblockview';
import IndentedCodeBlockView from 'src/views/indentedcodeblockview';
import HtmlBlockView from 'src/views/htmlblockview';
import ThematicBreakView from 'src/views/thematicbreakview';
import ParagraphView from 'src/views/paragraphview';
import TextView from 'src/views/textview';
import CodeView from 'src/views/codeview';
import StrongEmphasisView from 'src/views/strongemphasisview';
import EmphasisView from 'src/views/emphasisview';
import LinkView from 'src/views/linkview';
import ImageView from 'src/views/imageview';
import HtmlInlineView from 'src/views/htmlinlineview';
import SoftLineBreakView from 'src/views/softlinebreakview';
import HardLineBreakView from 'src/views/hardlinebreakview';
import LinkReferenceDefinitionView from 'src/views/linkreferencedefinition';

const parser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();
const node = parser.parse(source.split(/\r\n|\r|\n/).join('\n'));

ContentView.setNodeRelationMap(
  new Map<typeof MarkdownNode, typeof ContentView>([
    [Document, DocView],
    [BlockQuote, BlockQuoteView],
    [BulletList, BulletListView],
    [OrderedList, OrderedListView],
    [ListItem, ListItemView],
    [Heading, HeadingView],
    [Paragraph, ParagraphView],
    [FencedCodeBlock, FencedCodeBlockView],
    [IndentedCodeBlock, IndentedCodeBlockView],
    [HtmlBlock, HtmlBlockView],
    [LinkReferenceDefinition, LinkReferenceDefinitionView],
    [ThematicBreak, ThematicBreakView],
    [Code, CodeView],
    [Link, LinkView],
    [Emphasis, EmphasisView],
    [StrongEmphasis, StrongEmphasisView],
    [HtmlInline, HtmlInlineView],
    [Image as any, ImageView],
    [Text, TextView],
    [SoftLineBreak, SoftLineBreakView],
    [HardLineBreak, HardLineBreakView]
  ])
);
const docView = new DocView(node);

window.document.getElementById('root')?.appendChild(docView.dom);
