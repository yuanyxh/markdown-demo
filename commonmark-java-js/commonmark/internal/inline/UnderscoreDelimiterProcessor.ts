import EmphasisDelimiterProcessor from './EmphasisDelimiterProcessor';

class UnderscoreDelimiterProcessor extends EmphasisDelimiterProcessor {
  constructor() {
    super('_');
  }
}

export default UnderscoreDelimiterProcessor;
