import type Definitions from '../Definitions';
import type { InlineContentParserFactory, InlineParserContext, LinkProcessor, DelimiterProcessor } from '@/parser';
import { LinkReferenceDefinition } from '@/node';
declare class InlineParserContextImpl implements InlineParserContext {
    private readonly inlineContentParserFactories;
    private readonly delimiterProcessors;
    private readonly linkProcessors;
    private readonly linkMarkers;
    private readonly definitions;
    constructor(inlineContentParserFactories: InlineContentParserFactory[], delimiterProcessors: DelimiterProcessor[], linkProcessors: LinkProcessor[], linkMarkers: Set<string>, definitions: Definitions);
    getCustomInlineContentParserFactories(): InlineContentParserFactory[];
    getCustomDelimiterProcessors(): DelimiterProcessor[];
    getCustomLinkProcessors(): LinkProcessor[];
    getCustomLinkMarkers(): Set<string>;
    getLinkReferenceDefinition(label: string): LinkReferenceDefinition | null;
    getDefinition<D extends abstract new (...args: any) => any>(type: D, label: string): InstanceType<D> | null;
}
export default InlineParserContextImpl;
