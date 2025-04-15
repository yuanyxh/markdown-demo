import type { Visitor } from './interfaces/Visitor';

import ListBlock from './ListBlock';

class OrderedList extends ListBlock {
  private markerDelimiter: string | undefined;
  private markerStartNumber: number | undefined;

  constructor() {
    super('ordered-list');
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the start number used in the marker, e.g. {@code 1}, if available, or null otherwise
   */
  getMarkerStartNumber(): number | undefined {
    return this.markerStartNumber;
  }

  setMarkerStartNumber(markerStartNumber: number) {
    this.markerStartNumber = markerStartNumber;
  }

  /**
   * @return the delimiter used in the marker, e.g. {@code .} or {@code )}, if available, or null otherwise
   */
  getMarkerDelimiter(): string | undefined {
    return this.markerDelimiter;
  }

  setMarkerDelimiter(markerDelimiter: string) {
    this.markerDelimiter = markerDelimiter;
  }
}

export default OrderedList;
