import type { Visitor } from "./interfaces/Visitor";

import ListBlock from "./ListBlock";
import { isNotUnDef } from "../../helpers";

/**
 * 有序列表
 */
class OrderedList extends ListBlock {
  private markerDelimiter: string | undefined;
  private markerStartNumber: number | undefined;

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取有序列表的开始序号
   *
   * @return the start number used in the marker, e.g. {@code 1}, if available, or null otherwise
   */
  public getMarkerStartNumber(): number | undefined {
    return this.markerStartNumber;
  }

  /**
   * 设置有序列表的开始序号
   *
   * @param markerStartNumber
   */
  public setMarkerStartNumber(markerStartNumber: number) {
    this.markerStartNumber = markerStartNumber;
  }

  /**
   * 获取有序列表数字序号后的隔断符
   *
   * @return the delimiter used in the marker, e.g. {@code .} or {@code )}, if available, or null otherwise
   */
  public getMarkerDelimiter(): string | undefined {
    return this.markerDelimiter;
  }

  /**
   * 设置有序列表数字序号后的隔断符
   *
   * @param markerDelimiter
   */
  public setMarkerDelimiter(markerDelimiter: string) {
    this.markerDelimiter = markerDelimiter;
  }
}

export default OrderedList;
