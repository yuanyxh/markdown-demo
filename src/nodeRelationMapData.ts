import type { Node } from 'commonmark-java-js';
import type ContentView from './views/abstracts/contentview';

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
  IndentedCodeBlock,
  Link,
  LinkReferenceDefinition,
  ListItem,
  OrderedList,
  Paragraph,
  SoftLineBreak,
  StrongEmphasis,
  Text,
  ThematicBreak
} from 'commonmark-java-js';

import DocView from './views/docview';
import BlockQuoteView from './views/blockquoteview';
import BulletListView from './views/bulletlistview';
import OrderedListView from './views/orderedlistview';
import ListItemView from './views/listitemview';
import HeadingView from './views/headingview';
import FencedCodeBlockView from './views/fencedcodeblockview';
import IndentedCodeBlockView from './views/indentedcodeblockview';
import HtmlBlockView from './views/htmlblockview';
import ThematicBreakView from './views/thematicbreakview';
import ParagraphView from './views/paragraphview';
import TextView from './views/textview';
import CodeView from './views/codeview';
import StrongEmphasisView from './views/strongemphasisview';
import EmphasisView from './views/emphasisview';
import LinkView from './views/linkview';
import ImageView from './views/imageview';
import HtmlInlineView from './views/htmlinlineview';
import SoftLineBreakView from './views/softlinebreakview';
import HardLineBreakView from './views/hardlinebreakview';
import LinkReferenceDefinitionView from './views/linkreferencedefinition';

export const defaultRelationMap = new Map<typeof Node, typeof ContentView>([
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
  [Image, ImageView],
  [Text, TextView],
  [SoftLineBreak, SoftLineBreakView],
  [HardLineBreak, HardLineBreakView]
]);
