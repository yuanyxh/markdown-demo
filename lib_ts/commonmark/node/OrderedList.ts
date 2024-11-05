import ListBlock from "./ListBlock";
import { Visitor } from "./Visitor";

class OrderedList extends ListBlock {
  private markerDelimiter = "";
  private markerStartNumber = -1;

  public accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the start number used in the marker, e.g. {@code 1}, if available, or null otherwise
   */
  public getMarkerStartNumber(): number {
    return this.markerStartNumber;
  }

  public setMarkerStartNumber(markerStartNumber: number) {
    this.markerStartNumber = markerStartNumber;
  }

  /**
   * @return the delimiter used in the marker, e.g. {@code .} or {@code )}, if available, or null otherwise
   */
  public getMarkerDelimiter(): string {
    return this.markerDelimiter;
  }

  public setMarkerDelimiter(markerDelimiter: string) {
    this.markerDelimiter = markerDelimiter;
  }

  /**
   * @deprecated use {@link #getMarkerStartNumber()} instead
   */
  public getStartNumber(): number {
    return this.markerStartNumber !== -1 ? this.markerStartNumber : 0;
  }

  /**
   * @deprecated use {@link #setMarkerStartNumber} instead
   */
  public setStartNumber(startNumber: number): void {
    this.markerStartNumber = startNumber !== 0 ? startNumber : -1;
  }

  /**
   * @deprecated use {@link #getMarkerDelimiter()} instead
   */
  public getDelimiter(): string {
    return this.markerDelimiter !== "" ? this.markerDelimiter.charAt(0) : "\0";
  }

  /**
   * @deprecated use {@link #setMarkerDelimiter} instead
   */
  public setDelimiter(delimiter: string): void {
    this.markerDelimiter = delimiter !== "\0" ? delimiter : "";
  }
}

export default OrderedList;
