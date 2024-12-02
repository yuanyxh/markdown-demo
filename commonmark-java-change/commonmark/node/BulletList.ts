import type { Visitor } from "./interfaces/Visitor";

import { isNotUnDef } from "../../common";
import ListBlock from "./ListBlock";

class BulletList extends ListBlock {
  private marker: string | undefined;

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the bullet list marker that was used, e.g. {@code -}, {@code *} or {@code +}, if available, or null otherwise
   */
  public getMarker(): string | undefined {
    return this.marker;
  }

  public setMarker(marker: string | undefined) {
    this.marker = marker;
  }

  /**
   * @deprecated use {@link #getMarker()} instead
   */
  public getBulletMarker(): string {
    return isNotUnDef(this.marker) ? this.marker.charAt(0) : "\0";
  }

  /**
   * @deprecated use {@link #getMarker()} instead
   */
  public setBulletMarker(bulletMarker: string) {
    this.marker = bulletMarker !== "\0" ? bulletMarker : void 0;
  }
}

export default BulletList;
