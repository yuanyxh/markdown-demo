import type { Node } from 'commonmark-java-js';
import type { EditorOptions, NodeConfig } from './Editor';
import type ContentView from './views/abstracts/contentview';

import { Parser, IncludeSourceSpans } from 'commonmark-java-js';
import NodeRelationMap from './NodeRelationMap';
import { defaultRelationMap } from './nodeRelationMapData';
import DocView from './views/docview';

class EditorContext {
  parser: Parser;
  nodeRelationMap = new NodeRelationMap();

  docView: DocView;

  constructor(options: Omit<EditorOptions, 'parent'>) {
    this.parser = this.configurationNodeParser(options.nodeConfig);

    this.docView = new DocView(this.parser.parse(this.normalizeText(options.doc ?? '')), this);
  }

  normalizeText(source: string): string {
    return source.split(/\r\n|\r|\n/).join('\n');
  }

  createViewByNodeType(node: Node): ContentView | null {
    const Constructor = this.nodeRelationMap.get(Object.getPrototypeOf(node).constructor);

    if (Constructor) {
      return Constructor.craete(node, this);
    }

    return null;
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
