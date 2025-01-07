import type { Visitor } from "./interfaces/Visitor";

import ListBlock from "./ListBlock";

class OrderedList extends ListBlock {
  private markerDelimiter: string | undefined;
  private markerStartNumber: number | undefined;

  public constructor() {
    super("ordered-list");
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the start number used in the marker, e.g. {@code 1}, if available, or null otherwise
   */
  public getMarkerStartNumber(): number | undefined {
    return this.markerStartNumber;
  }

  public setMarkerStartNumber(markerStartNumber: number) {
    this.markerStartNumber = markerStartNumber;
  }

  /**
   * @return the delimiter used in the marker, e.g. {@code .} or {@code )}, if available, or null otherwise
   */
  public getMarkerDelimiter(): string | undefined {
    return this.markerDelimiter;
  }

  public setMarkerDelimiter(markerDelimiter: string) {
    this.markerDelimiter = markerDelimiter;
  }
}

export default OrderedList;
