import Character from "../../common/Character";
import { LinkReferenceDefinition } from "../node";
import {
  DelimiterProcessor,
  InlineContentParserFactory,
  InlineParserContext,
  LinkProcessor,
} from "../parser";
import Definitions from "./Definitions";

class InlineParserContextImpl implements InlineParserContext {
  private readonly inlineContentParserFactories: InlineContentParserFactory[];
  private readonly delimiterProcessors: DelimiterProcessor[];
  private readonly linkProcessors: LinkProcessor[];
  private readonly linkMarkers: Set<Character>;
  private readonly definitions: Definitions;

  public constructor(
    inlineContentParserFactories: InlineContentParserFactory[],
    delimiterProcessors: DelimiterProcessor[],
    linkProcessors: LinkProcessor[],
    linkMarkers: Set<Character>,
    definitions: Definitions
  ) {
    this.inlineContentParserFactories = inlineContentParserFactories;
    this.delimiterProcessors = delimiterProcessors;
    this.linkProcessors = linkProcessors;
    this.linkMarkers = linkMarkers;
    this.definitions = definitions;
  }

  public getCustomInlineContentParserFactories(): InlineContentParserFactory[] {
    return this.inlineContentParserFactories;
  }

  public getCustomDelimiterProcessors(): DelimiterProcessor[] {
    return this.delimiterProcessors;
  }

  public getCustomLinkProcessors(): LinkProcessor[] {
    return this.linkProcessors;
  }

  public getCustomLinkMarkers(): Set<Character> {
    return this.linkMarkers;
  }

  public getLinkReferenceDefinition(
    label: string
  ): LinkReferenceDefinition | null {
    return this.definitions.getDefinition(LinkReferenceDefinition, label);
  }

  public getDefinition<D extends abstract new (...args: any) => any>(
    type: D,
    label: string
  ): InstanceType<D> | null {
    return this.definitions.getDefinition(type, label);
  }
}

export default InlineParserContextImpl;
