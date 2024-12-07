import type { Visitor } from "./interfaces/Visitor";

import { isNotUnDef } from "../../helpers";
import ListBlock from "./ListBlock";

/**
 * 无序列表
 */
class BulletList extends ListBlock {
  private marker: string | undefined;

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 返回无序列表的标记（*、+、-）
   *
   * @return the bullet list marker that was used, e.g. {@code -}, {@code *} or {@code +}, if available, or null otherwise
   */
  public getMarker(): string | undefined {
    return this.marker;
  }

  /**
   * 设置无序列表的标记
   *
   * @param marker
   */
  public setMarker(marker: string | undefined) {
    this.marker = marker;
  }
}

export default BulletList;
