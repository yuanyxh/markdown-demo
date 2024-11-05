import ListBlock from "./ListBlock";
import { Visitor } from "./Visitor";

class BulletList extends ListBlock {
  private marker = "";

  public accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the bullet list marker that was used, e.g. {@code -}, {@code *} or {@code +}, if available, or null otherwise
   */
  public getMarker(): string {
    return this.marker;
  }

  public setMarker(marker: string): void {
    this.marker = marker;
  }

  /**
   * @deprecated use {@link #getMarker()} instead
   */
  public getBulletMarker(): string {
    return this.marker !== "" ? this.marker.charAt(0) : "\0";
  }

  /**
   * @deprecated use {@link #getMarker()} instead
   */
  public setBulletMarker(bulletMarker: string): void {
    this.marker = bulletMarker !== "\0" ? bulletMarker : "";
  }
}

export default BulletList;
