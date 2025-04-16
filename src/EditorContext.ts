import type { Document, Node } from 'commonmark-java-js';
import type { EditorOptions, NodeConfig } from './Editor';
import type ContentView from './views/abstracts/contentview';

import { Parser, IncludeSourceSpans, Paragraph, SourceSpan } from 'commonmark-java-js';
import NodeRelationMap from './NodeRelationMap';
import { defaultRelationMap } from './nodeRelationMapData';
import DocView from './views/docview';
import EditorCursor from './EditorCursor';

class EditorContext {
  readonly parser: Parser;
  readonly nodeRelationMap = new NodeRelationMap();
  readonly cursor: EditorCursor;

  docView: DocView;

  private sourceCode: string;

  constructor(options: EditorOptions) {
    this.sourceCode = options.doc ?? '';

    this.parser = this.configurationNodeParser(options.nodeConfig);
    this.cursor = new EditorCursor(this);

    this.docView = new DocView(this.parseMarkdown(this.sourceCode), this);
    this.docView.attachTo(options.parent);
  }

  parseMarkdown(text: string): Document {
    const doc = this.parser.parse(this.normalizeText(text));

    if (!doc.children.length) {
      const p = new Paragraph();
      p.addSourceSpan(SourceSpan.of(0, 0, 0, 0));
      doc.appendChild(p);
    }

    return doc;
  }

  updateSourceCode(text: string): void {
    this.sourceCode =
      this.sourceCode.slice(0, this.cursor.selection.start) +
      text +
      this.sourceCode.slice(this.cursor.selection.end);

    this.docView.setNode(this.parseMarkdown(this.sourceCode));
  }

  normalizeText(source: string): string {
    return source
      .split(/\r\n|\r|\n/)
      .map((line) => this.replaceEndSpace(line))
      .join('\n');
  }

  getNodeViewConstructor(node: Node): typeof ContentView | null {
    return this.nodeRelationMap.get(Object.getPrototypeOf(node).constructor) || null;
  }

  getTextData(e: InputEvent): string {
    return e.data ?? '';
  }

  private replaceEndSpace(line: string): string {
    return line.replace(/\s+$/, (substring) => {
      return '\u2003'.repeat(substring.length);
    });
  }

  private configurationNodeParser(config?: NodeConfig): Parser {
    const builder = Parser.builder();

    const map = new Map<typeof Node, typeof ContentView>(defaultRelationMap);

    if (config?.includes) {
      for (const nodeDefinition of config.includes) {
        map.set(nodeDefinition.nodeType, nodeDefinition.nodeView);

        nodeDefinition.blockParserFactory &&
          builder.customBlockParserFactory(nodeDefinition.blockParserFactory);

        nodeDefinition.inlineContentParserFactory &&
          builder.customInlineContentParserFactory(nodeDefinition.inlineContentParserFactory);
      }
    }

    if (config?.excludes) {
      this.nodeRelationMap.exclude(config.excludes);
    }

    this.nodeRelationMap.add(map);

    return builder.setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES).build();
  }
}

export default EditorContext;
