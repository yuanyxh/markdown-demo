import type { Document, Node } from 'commonmark-java-js';
import type { EditorOptions, NodeConfig } from './Editor';
import type ContentView from './views/abstracts/contentview';

import { Parser, IncludeSourceSpans, Paragraph, SourceSpan } from 'commonmark-java-js';
import NodeRelationMap from './NodeRelationMap';
import { defaultRelationMap } from './nodeRelationMapData';

class EditorContext {
  parser: Parser;
  nodeRelationMap = new NodeRelationMap();

  constructor(options: Omit<EditorOptions, 'parent'>) {
    this.parser = this.configurationNodeParser(options.nodeConfig);
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

  normalizeText(source: string): string {
    return source.split(/\r\n|\r|\n/).join('\n');
  }

  getNodeViewConstructor(node: Node): typeof ContentView | null {
    return this.nodeRelationMap.get(Object.getPrototypeOf(node).constructor) || null;
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
