import type Definitions from '../Definitions';
import type {
  InlineContentParserFactory,
  InlineParserContext,
  LinkProcessor,
  DelimiterProcessor
} from '@/parser';

import { LinkReferenceDefinition } from '@/node';

class InlineParserContextImpl implements InlineParserContext {
  private readonly inlineContentParserFactories: InlineContentParserFactory[];
  private readonly delimiterProcessors: DelimiterProcessor[];
  private readonly linkProcessors: LinkProcessor[];
  private readonly linkMarkers: Set<string>;
  private readonly definitions: Definitions;

  constructor(
    inlineContentParserFactories: InlineContentParserFactory[],
    delimiterProcessors: DelimiterProcessor[],
    linkProcessors: LinkProcessor[],
    linkMarkers: Set<string>,
    definitions: Definitions
  ) {
    this.inlineContentParserFactories = inlineContentParserFactories;
    this.delimiterProcessors = delimiterProcessors;
    this.linkProcessors = linkProcessors;
    this.linkMarkers = linkMarkers;
    this.definitions = definitions;
  }

  getCustomInlineContentParserFactories(): InlineContentParserFactory[] {
    return this.inlineContentParserFactories;
  }

  getCustomDelimiterProcessors(): DelimiterProcessor[] {
    return this.delimiterProcessors;
  }

  getCustomLinkProcessors(): LinkProcessor[] {
    return this.linkProcessors;
  }

  getCustomLinkMarkers(): Set<string> {
    return this.linkMarkers;
  }

  getLinkReferenceDefinition(label: string): LinkReferenceDefinition | null {
    return this.definitions.getDefinition(LinkReferenceDefinition, label);
  }

  getDefinition<D extends abstract new (...args: any) => any>(
    type: D,
    label: string
  ): InstanceType<D> | null {
    return this.definitions.getDefinition(type, label);
  }
}

export default InlineParserContextImpl;
