import type { Visitor } from "./interfaces/Visitor";

import ListBlock from "./ListBlock";
import { isNotUnDef } from "../../helpers";

class OrderedList extends ListBlock {
  private markerDelimiter: string | undefined;
  private markerStartNumber: number | undefined;

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

  /**
   * @deprecated use {@link #getMarkerStartNumber()} instead
   */
  public getStartNumber(): number {
    return isNotUnDef(this.markerStartNumber) ? this.markerStartNumber : 0;
  }

  /**
   * @deprecated use {@link #setMarkerStartNumber} instead
   */
  public setStartNumber(startNumber: number) {
    this.markerStartNumber = startNumber !== 0 ? startNumber : void 0;
  }

  /**
   * @deprecated use {@link #getMarkerDelimiter()} instead
   */
  public getDelimiter(): string {
    return isNotUnDef(this.markerDelimiter)
      ? this.markerDelimiter.charAt(0)
      : "\0";
  }

  /**
   * @deprecated use {@link #setMarkerDelimiter} instead
   */
  public setDelimiter(delimiter: string): void {
    this.markerDelimiter = delimiter !== "\0" ? delimiter : void 0;
  }
}

export default OrderedList;
