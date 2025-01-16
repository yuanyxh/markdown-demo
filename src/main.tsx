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

import ContentView from '@/views/abstracts/contentview';
import DocView from '@/views/docview';
import BlockQuoteView from '@/views/blockquoteview';
import BulletListView from '@/views/bulletlistview';
import OrderedListView from '@/views/orderedlistview';
import ListItemView from '@/views/listitemview';
import HeadingView from '@/views/headingview';
import FencedCodeBlockView from '@/views/fencedcodeblockview';
import IndentedCodeBlockView from '@/views/indentedcodeblockview';
import HtmlBlockView from '@/views/htmlblockview';
import ThematicBreakView from '@/views/thematicbreakview';
import ParagraphView from '@/views/paragraphview';
import TextView from '@/views/textview';
import CodeView from '@/views/codeview';
import StrongEmphasisView from '@/views/strongemphasisview';
import EmphasisView from '@/views/emphasisview';
import LinkView from '@/views/linkview';
import ImageView from '@/views/imageview';
import HtmlInlineView from '@/views/htmlinlineview';
import SoftLineBreakView from '@/views/softlinebreakview';
import HardLineBreakView from '@/views/hardlinebreakview';
import LinkReferenceDefinitionView from '@/views/linkreferencedefinition';

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
